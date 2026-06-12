import { FPMessageUtility } from "./FPMessageUtility.mjs";
import { FP } from "../config.mjs";

/**
 * Utility class for dice rolling dialogs - v13 with DialogV2 and native DOM
 */
export class FPRollUtility {

    /**
     * Helper to get value from form element by selector
     * @param {HTMLFormElement} form - The form element
     * @param {string} selector - CSS selector for the input
     * @returns {string} The element value or empty string
     */
    static _getVal(form, selector) {
        const el = form.querySelector(selector);
        return el?.value || "";
    }

    /**
     * Helper to get checked state from form element
     * @param {HTMLFormElement} form - The form element
     * @param {string} selector - CSS selector for the checkbox
     * @returns {boolean} Whether the checkbox is checked
     */
    static _getChecked(form, selector) {
        const el = form.querySelector(selector);
        return el?.checked || false;
    }

    /**
     * Display upkeep payment dialog
     * @param {string} template - Path to the template
     * @param {object} data - Data for template rendering
     * @param {FPActor} data.actor - The crew actor
     * @param {number} data.credits - Current credits
     * @returns {Promise<void>}
     */
    static async upkeepDialog(template, data) {
        console.log("upkeep data: ", data);

        const content = await foundry.applications.handlebars.renderTemplate(template, data);

        const result = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.ui.rolldialog.upkeep.unp") },
            classes: ['fp-roll-dialog'],
            content: content,
            position: { width: 275 },
            ok: {
                label: game.i18n.localize("FP.ui.general.continue"),
                callback: (event, button, dialog) => {
                    const form = button.form;
                    return {
                        debtPayment: Number(FPRollUtility._getVal(form, '#debt-pay') || 0),
                        crewPayment: Number(FPRollUtility._getVal(form, '#crew-pay') || 0),
                        repairPayment: Number(FPRollUtility._getVal(form, '#repair-pay') || 0),
                        medPayment: Number(FPRollUtility._getVal(form, '#med-pay') || 0)
                    };
                }
            },
            rejectClose: false
        });

        if (result) {
            return data.actor.handleUpkeep(result.debtPayment, result.crewPayment, result.repairPayment, result.medPayment);
        }
    }

    /**
     * Display crew task assignment dialog
     * @param {string} template - Path to the template
     * @param {object} data - Data for template rendering
     * @param {FPActor} data.actor - The crew actor
     * @param {string[]} data.crew_names - List of crew member names
     * @returns {Promise<void>}
     */
    static async crewTaskDialog(template, data) {
        console.log("data to crew tasks: ", data);

        const content = await foundry.applications.handlebars.renderTemplate(template, data);

        const result = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.campaign_turn.crew_tasks.entity") },
            classes: ['fp-roll-dialog'],
            content: content,
            position: { width: 500 },
            ok: {
                label: game.i18n.localize("FP.ui.general.continue"),
                callback: (event, button, dialog) => {
                    const form = button.form;
                    const getVal = (sel) => FPRollUtility._getVal(form, sel);

                    const taskAssignments = {
                        finders: [],
                        trainers: [],
                        traders: [],
                        recruiters: [],
                        explorers: [],
                        trackers: [],
                        repairers: [],
                        decoys: []
                    };

                    // Finders
                    if (getVal("#finder1")) taskAssignments.finders.push(getVal("#finder1"));
                    if (getVal("#finder2")) taskAssignments.finders.push(getVal("#finder2"));
                    taskAssignments.findOutcome = getVal("#find-outcome");

                    // Trainers
                    if (getVal("#trainer1")) taskAssignments.trainers.push(getVal("#trainer1"));
                    if (getVal("#trainer2")) taskAssignments.trainers.push(getVal("#trainer2"));
                    taskAssignments.trainOutcome = getVal("#train-outcome");

                    // Traders
                    if (getVal("#trader1")) taskAssignments.traders.push(getVal("#trader1"));
                    if (getVal("#trader2")) taskAssignments.traders.push(getVal("#trader2"));
                    taskAssignments.tradeOutcome = getVal("#trade-outcome");

                    // Recruiters
                    if (getVal("#recruiter1")) taskAssignments.recruiters.push(getVal("#recruiter1"));
                    if (getVal("#recruiter2")) taskAssignments.recruiters.push(getVal("#recruiter2"));
                    taskAssignments.recruitOutcome = getVal("#recruit-outcome");

                    // Explorers
                    if (getVal("#explorer1")) taskAssignments.explorers.push(getVal("#explorer1"));
                    if (getVal("#explorer2")) taskAssignments.explorers.push(getVal("#explorer2"));
                    taskAssignments.exploreOutcome = getVal("#explore-outcome");

                    // Trackers
                    if (getVal("#tracker1")) taskAssignments.trackers.push(getVal("#tracker1"));
                    if (getVal("#tracker2")) taskAssignments.trackers.push(getVal("#tracker2"));
                    taskAssignments.trackOutcome = getVal("#track-outcome");

                    // Repairers
                    if (getVal("#repairer1")) taskAssignments.repairers.push(getVal("#repairer1"));
                    if (getVal("#repairer2")) taskAssignments.repairers.push(getVal("#repairer2"));
                    taskAssignments.repairOutcome = getVal("#repair-outcome");

                    // Decoys
                    if (getVal("#decoy1")) taskAssignments.decoys.push(getVal("#decoy1"));
                    if (getVal("#decoy2")) taskAssignments.decoys.push(getVal("#decoy2"));
                    taskAssignments.decoyOutcome = getVal("#decoy-outcome");

                    return taskAssignments;
                }
            },
            rejectClose: false
        });

        if (result) {
            return data.actor.handleCrewTasks(result);
        }
    }

    /**
     * Display post-battle outcome dialog
     * @param {string} template - Path to the template
     * @param {object} data - Data for template rendering
     * @param {FPActor} data.actor - The crew actor
     * @returns {Promise<void>}
     */
    static async postBattle(template, data) {
        const content = await foundry.applications.handlebars.renderTemplate(template, data);

        const result = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.campaign_turn.post.entity") },
            classes: ['fp-roll-dialog'],
            content: content,
            position: { width: 500 },
            ok: {
                label: game.i18n.localize("FP.ui.general.continue"),
                callback: (event, button, dialog) => {
                    const form = button.form;
                    const getVal = (sel) => FPRollUtility._getVal(form, sel);
                    const getChecked = (sel) => FPRollUtility._getChecked(form, sel);

                    return {
                        rival: getVal("#riv"),
                        rivbonus: getVal("#riv-mod"),
                        existingRival: getChecked("#exist-rival"),
                        rivOutcome: getVal("#riv-outcome"),
                        invasion: getVal("#inv"),
                        invbonus: getVal("#inv-mod"),
                        invthreat: getChecked("#inv-threat"),
                        invOutcome: getVal("#inv-outcome"),
                        patron: getVal("#pat"),
                        patOutcome: getVal("#pat-outcome"),
                        quest: getVal("#qst"),
                        questbonus: getVal("#qst-mod"),
                        questfinal: getChecked("#qst-final"),
                        qstOutcome: getVal("#qst-outcome"),
                        getPaid: getVal("#pay"),
                        paybonus: getVal("#pay-mod"),
                        payOutcome: getVal("#pay-outcome"),
                        finds: getVal("#fnd"),
                        findOutcome: getVal("#fnd-outcome"),
                        loot: getVal("#loot"),
                        lootrolls: getVal("#loot-mod"),
                        lootOutcome: getVal("#loot-outcome"),
                        campevent: getVal("#cev"),
                        cevOutcome: getVal("#cev-outcome"),
                        charev: getVal("#chv"),
                        chvTwice: getChecked("#chv-twice"),
                        chvOutcome: getVal("#chv-outcome")
                    };
                }
            },
            rejectClose: false
        });

        if (result) {
            return data.actor.postBattle(result);
        }
    }

    /**
     * Display basic dice roll dialog
     * @param {string} template - Path to the template
     * @param {object} data - Data for template rendering
     * @param {FPActor} data.actor - The actor performing the roll
     * @param {string} data.expr - Dice expression
     * @param {string} data.rollType - Type of roll
     * @param {string} data.imgs - Image set identifier
     * @returns {Promise<void>}
     */
    static async basicRoll(template, data) {
        const content = await foundry.applications.handlebars.renderTemplate(template, data);

        const result = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.ui.rolldialog.diceroll") },
            classes: ['fp-roll-dialog'],
            content: content,
            position: { width: 275 },
            ok: {
                label: game.i18n.localize("FP.ui.general.roll"),
                callback: (event, button, dialog) => {
                    const form = button.form;
                    return {
                        bonus: FPRollUtility._getVal(form, '#bonus') || "0",
                        malus: FPRollUtility._getVal(form, '#penalty') || "0"
                    };
                }
            },
            rejectClose: false
        });

        if (result) {
            data.bonus = result.bonus;
            data.malus = result.malus;

            const finalExpr = data.expr + "+" + data.bonus + "-" + data.malus;
            const r = new Roll(finalExpr);
            const rollInfo = await FPRollUtility.processRoll(r, data);
            FPMessageUtility.createChatMessage(rollInfo);
        }
    }

    /**
     * Display attack roll dialog with weapon modifiers
     * @param {string} template - Path to the template
     * @param {object} data - Data for template rendering
     * @param {string} data.a_name - Attacker name
     * @param {number} data.a_combat - Attacker combat skill
     * @param {string} data.w_name - Weapon name
     * @param {number} data.w_shots - Weapon shots
     * @returns {Promise<void>}
     */
    static async attackRoll(template, data) {
        data.rollType = "attack";

        const content = await foundry.applications.handlebars.renderTemplate(template, data);

        const result = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.ui.general.attackroll") },
            classes: ['fp-roll-dialog'],
            content: content,
            position: { width: 275 },
            ok: {
                label: game.i18n.localize("FP.ui.general.roll"),
                callback: (event, button, dialog) => {
                    const form = button.form;
                    return {
                        extraDice: FPRollUtility._getVal(form, '#extraDice') || "0",
                        bonus: FPRollUtility._getVal(form, '#bonus') || "0",
                        malus: FPRollUtility._getVal(form, '#penalty') || "0"
                    };
                }
            },
            rejectClose: false
        });

        if (result) {
            const dieType = data.die;
            const shots = data.w_shots;
            const extraDice = result.extraDice;
            data.bonus = result.bonus;
            data.malus = result.malus;

            const totalDice = parseInt(shots) + parseInt(extraDice);
            const finalExpr = totalDice + dieType + "+" + data.a_combat + "+" + data.bonus + "-" + data.malus;

            const r = new Roll(finalExpr);
            const rollInfo = await FPRollUtility.processRoll(r, data);
            FPMessageUtility.createChatMessage(rollInfo);
        }
    }

    /**
     * Display custom dice roll dialog
     * @param {string} template - Path to the template
     * @param {object} data - Data for template rendering
     * @param {FPActor} data.actor - The actor performing the roll
     * @returns {Promise<void>}
     */
    static async customRoll(template, data) {
        data.rollType = "custom";

        const content = await foundry.applications.handlebars.renderTemplate(template, data);

        const result = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("FP.ui.general.customroll") },
            classes: ['fp-roll-dialog'],
            content: content,
            position: { width: 275 },
            ok: {
                label: game.i18n.localize("FP.ui.general.roll"),
                callback: (event, button, dialog) => {
                    const form = button.form;
                    return {
                        numDice: FPRollUtility._getVal(form, '#cr-num-dice') || "1",
                        baseDice: FPRollUtility._getVal(form, '#cr-die-type') || "d6",
                        bonus: FPRollUtility._getVal(form, '#bonus') || "0",
                        malus: FPRollUtility._getVal(form, '#penalty') || "0"
                    };
                }
            },
            rejectClose: false
        });

        if (result) {
            let numDice = parseInt(result.numDice);
            if (numDice < 1) {
                console.warn("Can't roll fewer than 1 die");
                numDice = 1;
            }

            data.bonus = result.bonus;
            data.malus = result.malus;

            const finalExpr = numDice + result.baseDice + "+" + data.bonus + "-" + data.malus;

            const r = new Roll(finalExpr);
            const rollInfo = await FPRollUtility.processRoll(r, data);
            FPMessageUtility.createChatMessage(rollInfo);
        }
    }

    /**
     * Process a roll and build data for chat message
     * @param {Roll} roll - The Foundry Roll object
     * @param {object} data - Roll data including rollType
     * @returns {Promise<object>} Processed roll data with dice images
     */
    static async processRoll(roll, data) {
        // v13: evaluate() is async only
        await roll.evaluate();

        let diceArray = [];

        switch (data.rollType) {
            case "attack":
                diceArray = FPRollUtility.buildDiceImageArray(roll);
                data.results = diceArray;
                data.roll = roll;
                data.totalMod = parseInt(data.a_combat || 0) + parseInt(data.bonus || 0) - parseInt(data.malus || 0);
                break;

            case "custom":
            case "basic":
                if (data.imgs === "d100") {
                    if (roll.total < 10) {
                        const dImgCode = "d10_" + roll.total;
                        diceArray.push(
                            CONFIG.fiveparsecs.DICE_IMAGE.D10.d10_0,
                            CONFIG.fiveparsecs.DICE_IMAGE.D10[dImgCode]
                        );
                    } else {
                        const tensDigit = String(roll.total)[0];
                        const onesDigit = String(roll.total)[1];
                        const tImgCode = "d10_" + tensDigit;
                        const oImgCode = "d10_" + onesDigit;
                        diceArray.push(
                            CONFIG.fiveparsecs.DICE_IMAGE.D10[tImgCode],
                            CONFIG.fiveparsecs.DICE_IMAGE.D10[oImgCode]
                        );
                    }
                } else {
                    diceArray = FPRollUtility.buildDiceImageArray(roll);
                }

                data.results = diceArray;
                data.roll = roll;
                data.totalMod = parseInt(data.bonus || 0) - parseInt(data.malus || 0);
                break;

            default:
                await roll.toMessage();
                break;
        }

        return data;
    }

    /**
     * Build array of dice image URLs from roll results
     * @param {Roll} roll - The evaluated Roll object
     * @returns {string[]} Array of dice image URLs
     */
    static buildDiceImageArray(roll) {
        const diceImageArray = [];

        roll.dice.forEach(die => {
            let configCode = "";
            let imgCode = "";

            switch (die.faces) {
                case 4: configCode = "D4"; imgCode = "d4_"; break;
                case 6: configCode = "D6"; imgCode = "d6_"; break;
                case 8: configCode = "D8"; imgCode = "d8_"; break;
                case 10: configCode = "D10"; imgCode = "d10_"; break;
                case 12: configCode = "D12"; imgCode = "d12_"; break;
                case 20: configCode = "D20"; imgCode = "d20_"; break;
            }

            // v13: Use .results instead of .values
            die.results.forEach(result => {
                const imgCodeComplete = imgCode + result.result;
                const diceImageUrl = CONFIG.fiveparsecs.DICE_IMAGE[configCode]?.[imgCodeComplete];
                if (diceImageUrl) {
                    diceImageArray.push(diceImageUrl);
                }
            });
        });

        return diceImageArray;
    }
}
