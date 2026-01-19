/**
 * Campaign Turn Logger - v13 compatible
 */
export class FPTurnLogger {

    static async logCampaignTurn(crew) {
        // v13: Use .system instead of .data.data
        const data = crew.system.campaign_turn;
        console.log("Logger data: ", data);

        let battleTextArray = [];
        let jobTextArray = [];

        // v13: Use .system instead of .data.data
        const world = crew.items.filter(i => i.type === "world" && i.system.active)[0];
        const battles = crew.items.filter(i => i.type === "battle");
        const jobs = crew.items.filter(i => i.type === "patron_job");
        const numBattles = battles.length;
        const numJobs = jobs.length;

        battles.forEach(b => {
            // v13: Use .system
            battleTextArray.push(`<b>${game.i18n.localize("FP.log.battle")}</b>: ${b.system.type}
                                    / ${game.i18n.localize("FP.log.obj")}: ${b.system.objective}
                                    / ${game.i18n.localize("FP.log.oppo")}: ${b.system.opposition?.element_subtype || ""} (${b.system.opposition?.element || ""})
                                    / ${game.i18n.localize("FP.log.outcome")} ${b.system.outcome}`);
        });

        jobs.forEach(j => {
            // v13: Use .system
            const job_done = j.system.complete ? "Yes" : "No";
            jobTextArray.push(`<b>${game.i18n.localize("FP.log.patron")}</b>: ${j.system.patron_type}
                                 / ${game.i18n.localize("FP.log.dpay")}: ${j.system.danger_pay}
                                 / ${game.i18n.localize("FP.log.time")}: ${j.system.time_frame}
                                 / ${game.i18n.localize("FP.log.bhc")}: ${j.system.benefits}, ${j.system.hazards}, ${j.system.conditions}
                                 / ${game.i18n.localize("FP.log.done")}: ${job_done}`);
        });

        const finalBattleText = battleTextArray.join("<br/>");
        const finalJobText = jobTextArray.join("<br/>");

        const journalEntryHtml = game.i18n.format("FP.log.log_block", {
            fledInv: data.flee_outcome || "",
            travel_event: data.travel?.travel_event || "",
            thisWorld: world?.name || "Unknown",
            thisWorldTraits: world?.system.traits || "",
            thisWorldLicensing: world?.system.licensing || false,
            debt_text: data.upkeep?.debt_text || "",
            payroll_text: data.upkeep?.payroll_text || "",
            repair_text: data.upkeep?.repair_text || "",
            med_text: data.upkeep?.med_text || "",
            ct_final_text: data.crew_tasks?.ct_final_result || "",
            jobcount: numJobs,
            joblog: finalJobText,
            battcount: numBattles,
            battlog: finalBattleText,
            riv: data.post_battle?.riv || "",
            pat: data.post_battle?.pat || "",
            qst: data.post_battle?.qst || "",
            pay: data.post_battle?.pay || "",
            fnd: data.post_battle?.fnd || "",
            inv: data.post_battle?.inv || "",
            cev: data.post_battle?.cev || "",
            loot: data.post_battle?.loot || ""
        });

        const loggedEntry = {
            name: crew.name + " Campaign Log: " + (world?.name || "Unknown World"),
            pages: [{
                name: game.i18n.localize("FP.log.camplog"),
                type: "text",
                text: { content: journalEntryHtml }
            }]
        };

        return JournalEntry.create(loggedEntry);
    }
}
