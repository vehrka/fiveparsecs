/**
 * DataModel for Crew actors in Five Parsecs from Home
 * This is the most complex model with deeply nested campaign_turn structure
 */
export class CrewDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        // Travel sub-schema
        const TravelSchema = {
            traveling: new fields.BooleanField({ initial: false }),
            travel_event: new fields.StringField({ initial: "" }),
            departing: new fields.StringField({ initial: "" })
        };

        // Arrival sub-schema
        const ArrivalSchema = {
            followed: new fields.BooleanField({ initial: false }),
            arrival_complete: new fields.BooleanField({ initial: false }),
            arriving: new fields.StringField({ initial: "" })
        };

        // Upkeep sub-schema
        const UpkeepSchema = {
            debt: new fields.BooleanField({ initial: false }),
            debt_paid: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            payroll: new fields.BooleanField({ initial: false }),
            payroll_paid: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            ship_repair: new fields.BooleanField({ initial: false }),
            repair_cost: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            upkeep_complete: new fields.BooleanField({ initial: false }),
            upkeep_text: new fields.StringField({ initial: "" }),
            debt_text: new fields.StringField({ initial: "" }),
            payroll_text: new fields.StringField({ initial: "" }),
            repair_text: new fields.StringField({ initial: "" }),
            med_text: new fields.StringField({ initial: "" })
        };

        // Crew Tasks sub-schema
        const CrewTasksSchema = {
            patron_result: new fields.StringField({ initial: "" }),
            train_result: new fields.StringField({ initial: "" }),
            trade_result: new fields.StringField({ initial: "" }),
            recruit_result: new fields.StringField({ initial: "" }),
            recruits: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            explore_result: new fields.StringField({ initial: "" }),
            track_result: new fields.StringField({ initial: "" }),
            decoy_result: new fields.StringField({ initial: "" }),
            repair_result: new fields.StringField({ initial: "" }),
            ct_final_result: new fields.StringField({ initial: "" })
        };

        // Post Battle sub-schema
        const PostBattleSchema = {
            riv: new fields.StringField({ initial: "" }),
            pat: new fields.StringField({ initial: "" }),
            qst: new fields.StringField({ initial: "" }),
            pay: new fields.StringField({ initial: "" }),
            fnd: new fields.StringField({ initial: "" }),
            inv: new fields.StringField({ initial: "" }),
            cev: new fields.StringField({ initial: "" }),
            loot: new fields.StringField({ initial: "" })
        };

        // Campaign Turn sub-schema
        const CampaignTurnSchema = {
            turn_id: new fields.StringField({ initial: "" }),
            flee: new fields.BooleanField({ initial: false }),
            flee_outcome: new fields.StringField({ initial: "" }),
            travel: new fields.SchemaField(TravelSchema),
            arrival: new fields.SchemaField(ArrivalSchema),
            upkeep: new fields.SchemaField(UpkeepSchema),
            crew_tasks: new fields.SchemaField(CrewTasksSchema),
            post_battle: new fields.SchemaField(PostBattleSchema),
            battles: new fields.ArrayField(new fields.StringField()),
            jobs: new fields.ArrayField(new fields.StringField()),
            complete: new fields.BooleanField({ initial: false }),
            logged: new fields.BooleanField({ initial: false })
        };

        return {
            // name removed - inherited from Actor document
            sp: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            credits: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            patrons: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            rivals: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            members: new fields.ArrayField(new fields.StringField()),
            storytrack: new fields.StringField({ initial: "" }),
            event: new fields.StringField({ initial: "" }),
            clock: new fields.StringField({ initial: "" }),
            rumors: new fields.StringField({ initial: "" }),
            notes: new fields.HTMLField({ initial: "" }),
            stash: new fields.StringField({ initial: "" }),

            // Ship fields
            ship: new fields.StringField({ initial: "" }),
            hull: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            hullmax: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            debt: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            ship_traits: new fields.StringField({ initial: "" }),
            ship_upgrades: new fields.StringField({ initial: "" }),
            stashed_gear: new fields.StringField({ initial: "" }),

            // Campaign Turn (complex nested structure)
            campaign_turn: new fields.SchemaField(CampaignTurnSchema)
        };
    }
}
