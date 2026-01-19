/**
 * DataModel for CrewAssignment items in Five Parsecs from Home
 * Links a character actor to a crew
 */
export class CrewAssignmentDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            assigned_crew_name: new fields.StringField({ initial: "" }),
            assigned_crew_actorId: new fields.StringField({ initial: "" })
        };
    }
}
