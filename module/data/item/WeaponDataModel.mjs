/**
 * DataModel for Weapon items in Five Parsecs from Home
 */
export class WeaponDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            // name removed - inherited from Item document
            notes: new fields.HTMLField({ initial: "" }),
            rules: new fields.StringField({ initial: "" }),
            cost: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),

            // Weapon-specific fields
            range: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            shots: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            damage: new fields.NumberField({ required: true, initial: 0, integer: true }),
            traits: new fields.StringField({ initial: "" })
        };
    }
}
