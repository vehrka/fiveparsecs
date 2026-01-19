/**
 * DataModel for Battle items in Five Parsecs from Home
 */
export class BattleDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        // Opposition sub-schema
        const OppositionSchema = {
            base_number: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            bonus_number: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            specialists: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            uniques: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            unique_type: new fields.StringField({ initial: "" }),
            element: new fields.StringField({ initial: "" }),
            element_subtype: new fields.StringField({ initial: "" }),
            basic_weapon: new fields.StringField({ initial: "" }),
            spec_weapon: new fields.StringField({ initial: "" })
        };

        return {
            type: new fields.StringField({ initial: "" }),
            rival_name: new fields.StringField({ initial: "" }),
            rival_attack_type: new fields.StringField({ initial: "" }),
            deployment: new fields.StringField({ initial: "" }),
            objective: new fields.StringField({ initial: "" }),
            notable_sights: new fields.StringField({ initial: "" }),
            complete: new fields.BooleanField({ initial: false }),
            outcome: new fields.StringField({ initial: "" }),
            obj_complete: new fields.BooleanField({ initial: false }),
            casualties: new fields.NumberField({ initial: 0, min: 0, integer: true }),
            opposition: new fields.SchemaField(OppositionSchema)
        };
    }
}
