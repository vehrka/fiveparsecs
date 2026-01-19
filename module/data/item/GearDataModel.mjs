/**
 * DataModel for Gear items in Five Parsecs from Home
 */
export class GearDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            // name removed - inherited from Item document
            notes: new fields.HTMLField({ initial: "" }),
            rules: new fields.StringField({ initial: "" }),
            cost: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),

            // Gear-specific fields
            geartype: new fields.StringField({ initial: "" }),
            uses: new fields.NumberField({ required: true, initial: 1, min: 0, integer: true }),
            affects: new fields.StringField({ initial: "self" })
        };
    }
}
