import { FPProcGen } from "../utility/FPProcGen.mjs";
import { FPTurnLogger } from "../utility/FPTurnLogger.mjs";

export class FPActor extends Actor {

    /**
     * @override
     * In v13, DataModels handle their own prep via prepareBaseData/prepareDerivedData.
     * Actor-level prep is only needed for cross-type operations.
     */
    prepareBaseData() {
        super.prepareBaseData();
        // DataModels handle type-specific prep
    }

    // Campaign Turn Methods

    async newCampaignTurn(log) {
        const turnData = this.system;
        if (log) {
            await this.logCampaign(turnData);
        }
    }

    async handleFleeInvasion() {
        let outcome = "";
        // v13: Roll.evaluate() is async only
        const r = await new Roll("2d6").evaluate();
        if (r.total < 8) {
            outcome = game.i18n.localize("FP.campaign_turn.flee.flee_fail");
        } else {
            outcome = game.i18n.localize("FP.campaign_turn.flee.flee_success");
        }

        // v13: update paths use system.X
        await this.update({ 'system.campaign_turn.flee_outcome': outcome });
    }

    async handleTravel() {
        console.log("Entered handleTravel");

        // v13: Use DialogV2 with template
        const template = "systems/fiveparsecs/templates/roll/traveleventdialog.hbs";
        const content = await foundry.applications.handlebars.renderTemplate(template, {});

        const result = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.campaign_turn.travel.event") },
            content: content,
            ok: {
                label: game.i18n.localize("FP.ui.general.continue"),
                callback: (event, button, dialog) => {
                    return button.form.elements.tev?.value || "";
                }
            },
            rejectClose: false
        });

        if (result) {
            await this.update({ "system.campaign_turn.travel.travel_event": result });
        }
    }

    async handleArrival() {
        // v13: Roll.evaluate() is async only
        const follow = await new Roll("1d6").evaluate();
        console.log("Arrival Follow Check result: ", follow.total);

        const followed = follow.total > 5;
        await this.createWorld();
        await this.update({ "system.campaign_turn.arrival.followed": followed });
    }

    /**
     * Clear the current arrival world without deleting it.
     * Sets active=false on the current world but keeps it in Known Worlds.
     */
    async clearArrival() {
        const activeWorlds = this.items.filter(i => i.type === "world" && i.system.active);

        if (activeWorlds.length === 0) {
            ui.notifications.info(game.i18n.localize("FP.campaign_turn.arrival.no_active"));
            return;
        }

        // Deactivate all active worlds (should be just one, but be safe)
        for (const world of activeWorlds) {
            await world.update({ "system.active": false });
        }

        // Clear arrival data
        await this.update({
            "system.campaign_turn.arrival.followed": false,
            "system.campaign_turn.arrival.arrival_complete": false
        });
    }

    /**
     * Show a dialog to select from existing Known Worlds and set as arrival.
     */
    async selectKnownWorld() {
        const worlds = this.items.filter(i => i.type === "world");

        if (worlds.length === 0) {
            ui.notifications.warn(game.i18n.localize("FP.campaign_turn.arrival.no_worlds"));
            return;
        }

        const template = "systems/fiveparsecs/templates/roll/selectworlddialog.hbs";
        const content = await foundry.applications.handlebars.renderTemplate(template, { worlds });

        const selectedId = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.campaign_turn.arrival.select_title") },
            classes: ['fp-roll-dialog'],
            content: content,
            position: { width: 350 },
            ok: {
                label: game.i18n.localize("FP.ui.general.continue"),
                callback: (event, button, dialog) => {
                    const form = button.form;
                    const selected = form.querySelector('input[name="worldId"]:checked');
                    return selected?.value || null;
                }
            },
            rejectClose: false
        });

        if (selectedId) {
            await this.setWorldAsArrival(selectedId);
        }
    }

    /**
     * Set a specific world as the active arrival destination.
     * @param {string} worldId - The ID of the world item to set as arrival
     */
    async setWorldAsArrival(worldId) {
        const world = this.items.get(worldId);
        if (!world || world.type !== "world") return;

        // Already active? Do nothing
        if (world.system.active) {
            ui.notifications.info(game.i18n.format("FP.campaign_turn.arrival.already_active", { name: world.name }));
            return;
        }

        // Deactivate current active world(s)
        const activeWorlds = this.items.filter(i => i.type === "world" && i.system.active);
        for (const w of activeWorlds) {
            await w.update({ "system.active": false });
        }

        // Activate selected world
        await world.update({ "system.active": true });

        // Run follow check (same as handleArrival)
        const follow = await new Roll("1d6").evaluate();
        console.log("Arrival Follow Check result: ", follow.total);
        const followed = follow.total > 5;
        await this.update({ "system.campaign_turn.arrival.followed": followed });
    }

    async handleUpkeep(debtPmt, payroll, repairs, med) {
        const totalPmts = debtPmt + payroll + repairs + med;

        // v13: Access via this.system
        let bankBal = this.system.credits;
        let currDebt = this.system.debt;
        let currHull = this.system.hull;
        const maxHull = this.system.hullmax;

        let debtText = game.i18n.localize("FP.campaign_turn.upkeep.upkp_debt_default");
        let payText = game.i18n.localize("FP.campaign_turn.upkeep.upkp_pay_default");
        let medText = game.i18n.localize("FP.campaign_turn.upkeep.upkp_med_default");
        let repText = game.i18n.localize("FP.campaign_turn.upkeep.upkp_rep_default");

        console.log("totalPmts, bankBal, currDebt, currHull, maxHull: ", totalPmts, bankBal, currDebt, currHull, maxHull);

        if (totalPmts > bankBal) {
            return ui.notifications.warn("You don't have sufficient credits to cover these expenses");
        }

        // Ship Debt
        bankBal = Math.max(0, bankBal - debtPmt);
        currDebt = Math.max(0, currDebt - debtPmt);
        if (currDebt > 0) currDebt++;

        // Crew Pay
        bankBal = Math.max(0, bankBal - payroll);

        // Repairs
        bankBal = Math.max(0, bankBal - repairs);
        const totalHullRepair = repairs + 1;
        currHull = Math.min(currHull + totalHullRepair, maxHull);

        // Medical Treatment
        bankBal -= med;

        if (debtPmt > 0) { debtText = game.i18n.format("FP.campaign_turn.upkeep.upkp_debt_paid", { paid: debtPmt, owed: currDebt }); }
        if (payroll > 0) { payText = game.i18n.format("FP.campaign_turn.upkeep.upkp_crew_paid", { paychecks: payroll }); }
        if (repairs > 0) { repText = game.i18n.format("FP.campaign_turn.upkeep.upkp_rep_paid", { rep: repairs }); }
        if (med > 0) { medText = game.i18n.format("FP.campaign_turn.upkeep.upkp_med_paid", { copay: med }); }

        console.log("New BankBal (totalPmts): ", bankBal, totalPmts);

        await this.update({
            "system.debt": currDebt,
            "system.credits": bankBal,
            "system.hull": currHull,
            "system.campaign_turn.upkeep.debt_text": debtText,
            "system.campaign_turn.upkeep.payroll_text": payText,
            "system.campaign_turn.upkeep.repair_text": repText,
            "system.campaign_turn.upkeep.med_text": medText
        });
    }

    /**
     * Handle crew task assignments
     * @param {Object} assignments - data indicating which crew members are assigned to which Crew Task
     */
    async handleCrewTasks(assignments) {
        let ctFinalArray = [];

        let finalPatronText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.nofind_default");
        let finalTrainText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrain_default");
        let finalTradeText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrade_default");
        let finalRecruitText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.norecruit_default");
        let finalExploreText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.noexplore_default");
        let finalTrackText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrack_default");
        let finalRepairText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.norepair_default");
        let finalDecoyText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.nodecoy_default");

        const stdPatronText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.find_sfx");
        const stdTrainText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.train_sfx");
        const stdTradeText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.trade_sfx");
        const stdRecruitText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.recruit_sfx");
        const stdExploreText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.explore_sfx");
        const stdTrackText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.track_sfx");
        const stdRepairText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.repair_sfx");
        const stdDecoyText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.decoy_sfx");

        const join = game.i18n.localize("FP.ui.general.andjoin");

        console.log("Task Assignments: ", assignments);

        if (assignments.finders?.length) {
            finalPatronText = assignments.finders.join(join) + ((assignments.findOutcome && assignments.findOutcome !== "") ? " " + assignments.findOutcome : stdPatronText);
        }
        if (assignments.trainers?.length) {
            finalTrainText = assignments.trainers.join(join) + ((assignments.trainOutcome && assignments.trainOutcome !== "") ? " " + assignments.trainOutcome : stdTrainText);
        }
        if (assignments.traders?.length) {
            finalTradeText = assignments.traders.join(join) + ((assignments.tradeOutcome && assignments.tradeOutcome !== "") ? " " + assignments.tradeOutcome : stdTradeText);
        }
        if (assignments.recruiters?.length) {
            finalRecruitText = assignments.recruiters.join(join) + ((assignments.recruitOutcome && assignments.recruitOutcome !== "") ? " " + assignments.recruitOutcome : stdRecruitText);
        }
        if (assignments.explorers?.length) {
            finalExploreText = assignments.explorers.join(join) + ((assignments.exploreOutcome && assignments.exploreOutcome !== "") ? " " + assignments.exploreOutcome : stdExploreText);
        }
        if (assignments.trackers?.length) {
            finalTrackText = assignments.trackers.join(join) + ((assignments.trackOutcome && assignments.trackOutcome !== "") ? " " + assignments.trackOutcome : stdTrackText);
        }
        if (assignments.repairers?.length) {
            finalRepairText = assignments.repairers.join(join) + ((assignments.repairOutcome && assignments.repairOutcome !== "") ? " " + assignments.repairOutcome : stdRepairText);
        }
        if (assignments.decoys?.length) {
            finalDecoyText = assignments.decoys.join(join) + ((assignments.decoyOutcome && assignments.decoyOutcome !== "") ? " " + assignments.decoyOutcome : stdDecoyText);
        }

        ctFinalArray.push(finalPatronText, finalTrainText, finalTradeText, finalRecruitText, finalExploreText,
            finalTrackText, finalRepairText, finalDecoyText);

        const ctFinalText = ctFinalArray.join("<br/>");
        await this.update({ "system.campaign_turn.crew_tasks.ct_final_result": ctFinalText });
    }

    async addJob() {
        const itemData = {
            name: "New Patron Job",
            type: "patron_job"
        };
        return Item.create(itemData, { parent: this, renderSheet: true });
    }

    /**
     * Create a new world item
     */
    async createWorld() {
        // v13: Use .system instead of .data.data
        const activeWorldArray = this.items.filter(i => i.type === "world" && i.system.active);

        const itemData = {
            name: "New World",
            type: "world",
            system: {
                active: true
            }
        };

        console.log("Custom world data: ", itemData);

        if (Array.isArray(activeWorldArray) && activeWorldArray.length > 0) {
            const currentWorld = activeWorldArray[0];
            console.log("Current World: ", currentWorld);
            await currentWorld.update({ "system.active": false });
        }

        return Item.create(itemData, { parent: this, renderSheet: true });
    }

    /**
     * Creates a battle item to be added to the campaign turn
     */
    async addBattle(type, random, crewsize) {
        const itemData = {
            name: "New Battle",
            type: "battle"
        };
        return Item.create(itemData, { parent: this, renderSheet: true });
    }

    async postBattle(postData) {
        const pb = await FPProcGen.getPostBattleResults(postData);
        await this.update({
            "system.campaign_turn.post_battle.riv": pb.rivText,
            "system.campaign_turn.post_battle.pat": pb.patText,
            "system.campaign_turn.post_battle.qst": pb.questText,
            "system.campaign_turn.post_battle.pay": pb.payText,
            "system.campaign_turn.post_battle.inv": pb.invText,
            "system.campaign_turn.post_battle.fnd": pb.findText,
            "system.campaign_turn.post_battle.cev": pb.campEventText,
            "system.campaign_turn.post_battle.loot": pb.lootText
        });
    }

    async resetCampaignTurn(log) {
        const blank = this._getBlankCt();
        console.log("Logging? ", log);

        if (log === "yes") {
            await FPTurnLogger.logCampaignTurn(this);

            // v13: Use .id instead of .data._id
            const battList = this.items.filter(i => i.type === "battle");
            const jobList = this.items.filter(i => i.type === "patron_job");
            const delIds = [];

            console.log("jobList: ", jobList);
            battList.forEach(b => delIds.push(b.id));
            jobList.forEach(j => delIds.push(j.id));

            await this.deleteEmbeddedDocuments("Item", delIds);
            await this.update({ "system.campaign_turn": blank });
            await this.update({ "system.campaign_turn.crew_tasks.ct_final_result": "" });
        } else {
            const battList = this.items.filter(i => i.type === "battle");
            const jobList = this.items.filter(i => i.type === "patron_job");
            const delIds = [];

            battList.forEach(b => delIds.push(b.id));
            jobList.forEach(j => delIds.push(j.id));

            await this.update({ "system.campaign_turn": blank });
            await this.deleteEmbeddedDocuments("Item", delIds);
        }
    }

    _getBlankCt() {
        return {
            turn_id: "",
            flee: false,
            flee_outcome: "",
            travel: {
                traveling: false,
                travel_event: "",
                departing: ""
            },
            arrival: {
                followed: false,
                arrival_complete: false,
                arriving: ""
            },
            upkeep: {
                debt: false,
                debt_paid: 0,
                payroll: false,
                payroll_paid: 0,
                ship_repair: false,
                repair_cost: 0,
                upkeep_complete: false,
                upkeep_text: "",
                debt_text: "",
                payroll_text: "",
                repair_text: "",
                med_text: ""
            },
            crew_tasks: {
                patron_result: "",
                train_result: "",
                trade_result: "",
                recruit_result: "",
                recruits: 0,
                explore_result: "",
                track_result: "",
                decoy_result: "",
                repair_result: "",
                ct_final_result: ""
            },
            post_battle: {
                riv: "",
                pat: "",
                qst: "",
                pay: "",
                fnd: "",
                inv: "",
                cev: "",
                loot: ""
            },
            battles: [],
            jobs: [],
            complete: false,
            logged: false
        };
    }
}
