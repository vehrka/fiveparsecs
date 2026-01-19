/**
 * Mixin for Five Parsecs ApplicationV2 sheets.
 * Provides common functionality for both actor and item sheets.
 *
 * @template {typeof foundry.applications.api.ApplicationV2} T
 * @param {T} Base - The base ApplicationV2 class (already mixed with HandlebarsApplicationMixin)
 * @returns {T} Extended class with Five Parsecs functionality
 *
 * @mixin
 * @example
 * // Usage in FPActorSheet:
 * import { ApplicationV2Mixin } from '../applications/ApplicationV2Mixin.mjs';
 * const { ActorSheetV2, HandlebarsApplicationMixin } = foundry.applications.sheets;
 * export class FPActorSheet extends ApplicationV2Mixin(HandlebarsApplicationMixin(ActorSheetV2)) { }
 */
export function ApplicationV2Mixin(Base) {
  return class FPApplicationV2 extends Base {

    /**
     * Merge mixin actions with subclass actions.
     * Subclasses can override by defining the same action name.
     */
    static DEFAULT_OPTIONS = {
      actions: {
        editItem: FPApplicationV2._onEditItem,
        deleteItem: FPApplicationV2._onDeleteItem
      }
    };

    /**
     * Prepare common context data for all FP sheets.
     * @param {object} options - Render options
     * @returns {Promise<object>} Context with common properties
     * @inheritDoc
     * @protected
     */
    async _prepareContext(options) {
      const context = await super._prepareContext(options);

      // System configuration - available in all templates
      context.config = CONFIG.fiveparsecs;

      // Editability state
      context.isEditable = this.isEditable;
      context.cssClass = this.document.isOwner ? "editable" : "locked";

      // System data alias for template compatibility
      context.system = this.document.system;
      context.data = this.document.system; // Legacy alias

      return context;
    }

    /**
     * Edit an embedded item - opens its sheet.
     * Works for embedded items on actors. Items don't have embedded items.
     * @this {FPApplicationV2}
     * @param {PointerEvent} event - The click event
     * @param {HTMLElement} target - The clicked element
     * @protected
     */
    static async _onEditItem(event, target) {
      event.preventDefault();
      const itemRow = target.closest("[data-item-id]");
      const itemId = itemRow?.dataset.itemId;

      if (!itemId) return;

      // Guard: only actors have embedded items collection
      const item = this.document.items?.get(itemId);
      item?.sheet.render(true);
    }

    /**
     * Delete an embedded item with confirmation dialog.
     * @this {FPApplicationV2}
     * @param {PointerEvent} event - The click event
     * @param {HTMLElement} target - The clicked element
     * @protected
     */
    static async _onDeleteItem(event, target) {
      event.preventDefault();
      const itemRow = target.closest("[data-item-id]");
      const itemId = itemRow?.dataset.itemId;

      if (!itemId) return;

      // Guard: only actors have embedded items collection
      const item = this.document.items?.get(itemId);
      if (!item) return;

      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize("FP.ui.confirm.deleteItem") },
        content: `<p>${game.i18n.localize("FP.ui.confirm.deleteItemText")}</p>`,
        yes: { label: game.i18n.localize("FP.ui.general.yes") },
        no: { label: game.i18n.localize("FP.ui.general.cancel") }
      });

      if (confirmed) {
        await item.delete();
      }
    }
  };
}
