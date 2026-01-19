/**
 * DataModel for World items in Five Parsecs from Home
 */
export class WorldDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        // Factory functions to create fresh field instances for each use
        const createPatronSchema = () => ({
            name: new fields.StringField({ initial: "" }),
            benefit: new fields.StringField({ initial: "" })
        });

        const createRivalSchema = () => ({
            name: new fields.StringField({ initial: "" }),
            notes: new fields.StringField({ initial: "" })
        });

        return {
            known: new fields.BooleanField({ initial: false }),
            active: new fields.BooleanField({ initial: false }),
            traits: new fields.StringField({ initial: "" }),
            notes: new fields.HTMLField({ initial: "" }),
            licensing: new fields.BooleanField({ initial: false }),
            license_obtained: new fields.BooleanField({ initial: false }),
            invaders: new fields.StringField({ initial: "" }),
            inv_progress: new fields.StringField({ initial: "" }),

            // Patrons
            p1: new fields.SchemaField(createPatronSchema()),
            p2: new fields.SchemaField(createPatronSchema()),
            p3: new fields.SchemaField(createPatronSchema()),

            // Rivals
            r1: new fields.SchemaField(createRivalSchema()),
            r2: new fields.SchemaField(createRivalSchema()),
            r3: new fields.SchemaField(createRivalSchema())
        };
    }
}
