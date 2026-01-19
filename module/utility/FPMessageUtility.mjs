/**
 * Chat Message Utility - v13 compatible
 */
export class FPMessageUtility {

    /**
     * Create a chat message from roll data
     * v13: Updated ChatMessage API
     */
    static async createChatMessage(data) {
        const path = 'systems/fiveparsecs/templates/message/';
        const template = `${path}${data.rollType}_chat_message.hbs`;

        const msg = await foundry.applications.handlebars.renderTemplate(template, data);

        // v13 ChatMessage API changes:
        // - Use game.user.id instead of game.user._id
        // - Use rolls: [roll] instead of roll: roll
        // - type is no longer needed (inferred from rolls)
        await ChatMessage.create({
            user: game.user.id,
            rolls: data.roll ? [data.roll] : [],
            speaker: ChatMessage.getSpeaker(),
            content: msg
        });
    }
}
