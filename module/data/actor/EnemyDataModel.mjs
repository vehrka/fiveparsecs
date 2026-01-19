/**
 * DataModel for Enemy actors in Five Parsecs from Home
 */
export class EnemyDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            // name removed - inherited from Actor document
            speed: new fields.NumberField({ required: true, initial: 6, min: 0, integer: true }),
            combat: new fields.NumberField({ required: true, initial: 0, integer: true }),
            toughness: new fields.NumberField({ required: true, initial: 0, integer: true }),
            species: new fields.StringField({ initial: "human" }),
            notes: new fields.HTMLField({ initial: "" }),

            // Enemy-specific fields
            numbers: new fields.StringField({ initial: "" }),
            panic_val: new fields.NumberField({ required: true, initial: 1, min: 0, integer: true }),
            panic_str: new fields.StringField({ initial: "1-2" }),
            ai: new fields.StringField({ initial: "a" }),
            weapons: new fields.StringField({ initial: "1A" }),
            save: new fields.StringField({ initial: "" })
        };
    }
}
