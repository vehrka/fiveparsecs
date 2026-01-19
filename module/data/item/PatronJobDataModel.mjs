/**
 * DataModel for PatronJob items in Five Parsecs from Home
 */
export class PatronJobDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            patron_type: new fields.StringField({ initial: "" }),
            danger_pay: new fields.StringField({ initial: "" }),
            time_frame: new fields.StringField({ initial: "" }),
            benefits: new fields.StringField({ initial: "" }),
            hazards: new fields.StringField({ initial: "" }),
            conditions: new fields.StringField({ initial: "" }),
            complete: new fields.BooleanField({ initial: false })
        };
    }
}
