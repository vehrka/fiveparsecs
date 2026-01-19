/**
 * DataModel for Character actors in Five Parsecs from Home
 */
export class CharacterDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            // name removed - inherited from Actor document
            speed: new fields.NumberField({ required: true, initial: 6, min: 0, integer: true }),
            combat: new fields.NumberField({ required: true, initial: 0, integer: true }),
            toughness: new fields.NumberField({ required: true, initial: 0, integer: true }),
            species: new fields.StringField({ initial: "human" }),
            notes: new fields.HTMLField({ initial: "" }),

            // Character-specific fields
            reactions: new fields.NumberField({ required: true, initial: 1, min: 0, integer: true }),
            savvy: new fields.NumberField({ required: true, initial: 0, integer: true }),
            luck: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            xp: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            casualty: new fields.BooleanField({ initial: false }),
            captain: new fields.BooleanField({ initial: false }),
            injury: new fields.StringField({ initial: "" }),
            sickbay_time: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            save: new fields.StringField({ initial: "" }),
            use_bot_injury: new fields.BooleanField({ initial: false })
        };
    }
}
