import { ApplicationV2Mixin } from "../../applications/ApplicationV2Mixin.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Five Parsecs Item Sheet - v13 ApplicationV2
 * Uses ApplicationV2Mixin for shared functionality.
 */
export class FPItemSheet extends ApplicationV2Mixin(HandlebarsApplicationMixin(ItemSheetV2)) {

    static DEFAULT_OPTIONS = {
        tag: 'form',
        classes: ['fp', 'sheet', 'item', 'item-sheet'],
        position: { width: 500, height: 300 },
        window: {
            resizable: true
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            generateWorld: FPItemSheet.#onGenerateWorld
        }
    };

    static PARTS = {
        weapon: { template: "systems/fiveparsecs/templates/item/weaponsheet.hbs" },
        gear: { template: "systems/fiveparsecs/templates/item/gearsheet.hbs" },
        background: { template: "systems/fiveparsecs/templates/item/backgroundsheet.hbs" },
        class: { template: "systems/fiveparsecs/templates/item/classsheet.hbs" },
        motivation: { template: "systems/fiveparsecs/templates/item/motivationsheet.hbs" },
        crew_assignment: { template: "systems/fiveparsecs/templates/item/crew_assignmentsheet.hbs" },
        world: { template: "systems/fiveparsecs/templates/item/worldsheet.hbs" },
        patron_job: { template: "systems/fiveparsecs/templates/item/patron_jobsheet.hbs" },
        battle: { template: "systems/fiveparsecs/templates/item/battlesheet.hbs" }
    };

    /**
     * Determine which template part to use based on item type
     */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        options.parts = [this.document.type];
    }

    /**
     * v13: Replaces getData()
     * Extends mixin context with item-specific data.
     * @inheritDoc
     */
    async _prepareContext(options) {
        // Mixin provides: config, cssClass, isEditable, system, data
        const context = await super._prepareContext(options);

        // Item-specific context
        context.item = this.document;
        context.gameActors = game.actors;

        if (this.document.type === "crew_assignment") {
            context.eligibleCrew = this._getEligibleActors();
            context.eligibleCrewOptions = this._getEligibleCrewOptions();
        }

        if (this.document.type === "battle") {
            context.battleTypeOptions = {
                rival: game.i18n.localize("FP.ui.select.battle.rival"),
                patron: game.i18n.localize("FP.ui.select.battle.patron"),
                opportunity: game.i18n.localize("FP.ui.select.battle.opportunity"),
                quest: game.i18n.localize("FP.ui.select.battle.quest"),
                invasion: game.i18n.localize("FP.ui.select.battle.invasion")
            };
            context.battleOutcomeOptions = {
                Unfought: "Unfought",
                "Held the Field": "Held the Field",
                "Left the Field": "Left the Field",
                Defeated: "Defeated",
                Draw: "Draw"
            };
            context.oppositionElementOptions = {
                "Criminal Elements": "Criminal Elements",
                "Hired Muscle": "Hired Muscle",
                "Interested Parties": "Interested Parties",
                "Roving Threats": "Roving Threats"
            };
        }

        if (this.document.type === "patron_job") {
            context.patronTypeOptions = {
                Corporation: game.i18n.localize("FP.ui.select.patron.corp"),
                "Local Government": game.i18n.localize("FP.ui.select.patron.local"),
                "Sector Government": game.i18n.localize("FP.ui.select.patron.sector"),
                "Private Organization": game.i18n.localize("FP.ui.select.patron.private"),
                "Wealthy Individual": game.i18n.localize("FP.ui.select.patron.wealthy"),
                "Secretive Group": game.i18n.localize("FP.ui.select.patron.secret")
            };
        }

        return context;
    }

    _getEligibleCrewOptions() {
        const characters = game.actors.filter(actor => actor.type === "character");
        const options = {};
        characters.forEach(char => {
            options[char.id] = char.name;
        });
        return options;
    }

    _getEligibleActors() {
        const characters = game.actors.filter(actor => actor.type === "character");
        const eligibleCrew = [];

        characters.forEach(char => {
            eligibleCrew.push({
                eligibleName: char.name,
                eligibleId: char.id // v13: Use .id instead of .data._id
            });
        });

        return eligibleCrew;
    }

    /**
     * Handle generating a random world (stub)
     * @this {FPItemSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onGenerateWorld(event, target) {
        event.preventDefault();
        ui.notifications.warn("Non functional until tables are prepared");
    }
}
