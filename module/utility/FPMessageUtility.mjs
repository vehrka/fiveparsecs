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

        // v14 ChatMessage API:
        // - Use author: game.user.id (the v13 `user` field is removed in v14)
        // - Use rolls: [roll] instead of roll: roll
        // - type is no longer needed (inferred from rolls)
        await ChatMessage.create({
            author: game.user.id,
            rolls: data.roll ? [data.roll] : [],
            speaker: ChatMessage.getSpeaker(),
            content: msg
        });
    }
}
