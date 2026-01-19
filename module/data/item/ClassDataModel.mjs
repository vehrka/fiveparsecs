/**
 * DataModel for Class items in Five Parsecs from Home
 */
export class ClassDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            // name removed - inherited from Item document
            effect: new fields.StringField({ initial: "" }),
            resources: new fields.StringField({ initial: "" }),
            starting_rolls: new fields.StringField({ initial: "" })
        };
    }
}
