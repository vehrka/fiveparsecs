import { ApplicationV2Mixin } from "../../applications/ApplicationV2Mixin.mjs";
import { FPRollUtility } from "../../utility/FPRollUtility.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Five Parsecs Actor Sheet - v13 ApplicationV2
 * Uses ApplicationV2Mixin for shared functionality.
 */
export class FPActorSheet extends ApplicationV2Mixin(HandlebarsApplicationMixin(ActorSheetV2)) {

    static DEFAULT_OPTIONS = {
        tag: 'form',
        classes: ['fp', 'sheet', 'actor', 'actor-sheet'],
        position: { height: 400, width: 600 },
        window: {
            resizable: true
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        dragDrop: [{ dragSelector: ".dragline", dropSelector: null }],
        actions: {
            createItem: FPActorSheet.#onCreateItem,
            editItem: FPActorSheet.#onEditItem, // Override mixin to handle crew_actor case
            // deleteItem inherited from ApplicationV2Mixin
            diceRoll: FPActorSheet.#onDiceRoll,
            attackRoll: FPActorSheet.#onAttackRoll,
            refreshCrew: FPActorSheet.#onRefreshCrew,
            editCrewMember: FPActorSheet.#onEditCrewMember,
            campaignStep: FPActorSheet.#onCampaignStep,
            resetTurn: FPActorSheet.#onResetTurn,
            changeImage: FPActorSheet.#onChangeImage,
            setArrival: FPActorSheet.#onSetArrival
        }
    };

    static PARTS = {
        // Character parts
        characterHeader: {
            template: "systems/fiveparsecs/templates/actor/parts/character/header.hbs"
        },
        characterStats: {
            template: "systems/fiveparsecs/templates/actor/parts/character/stats.hbs"
        },
        characterItems: {
            template: "systems/fiveparsecs/templates/actor/parts/character/items.hbs",
            scrollable: ['']
        },
        characterNotes: {
            template: "systems/fiveparsecs/templates/actor/parts/character/notes.hbs"
        },

        // Enemy parts
        enemyHeader: {
            template: "systems/fiveparsecs/templates/actor/parts/enemy/header.hbs"
        },
        enemyStats: {
            template: "systems/fiveparsecs/templates/actor/parts/enemy/stats.hbs"
        },
        enemyItems: {
            template: "systems/fiveparsecs/templates/actor/parts/enemy/items.hbs",
            scrollable: ['']
        },
        enemyNotes: {
            template: "systems/fiveparsecs/templates/actor/parts/enemy/notes.hbs"
        },

        // Crew parts
        crewHeader: {
            template: "systems/fiveparsecs/templates/actor/parts/crew/header.hbs"
        },
        crewTabs: {
            template: "systems/fiveparsecs/templates/actor/parts/crew/tabs.hbs"
        },
        crewRoster: {
            template: "systems/fiveparsecs/templates/actor/parts/crew/roster.hbs",
            scrollable: ['.roster-list'],
            tab: "main"
        },
        crewTurn: {
            template: "systems/fiveparsecs/templates/actor/parts/crew/turn.hbs",
            scrollable: [''],
            tab: "turn"
        },
        crewWorlds: {
            template: "systems/fiveparsecs/templates/actor/parts/crew/worlds.hbs",
            scrollable: [''],
            tab: "worlds"
        }
    };

    static TABS = {
        primary: {
            group: "primary",
            tabs: [
                { id: "main", group: "primary", label: "FP.ui.crewsheet.roster" },
                { id: "turn", group: "primary", label: "FP.campaign_turn.entity" },
                { id: "worlds", group: "primary", label: "FP.ui.crewsheet.known" }
            ],
            initial: "main"
        }
    };

    /**
     * Determine which template parts to use based on actor type.
     * Selects compositional parts for modular sheet rendering.
     */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        const type = this.document.type;
        switch (type) {
            case 'character':
                options.parts = ['characterHeader', 'characterStats', 'characterItems', 'characterNotes'];
                break;
            case 'enemy':
                options.parts = ['enemyHeader', 'enemyStats', 'enemyItems', 'enemyNotes'];
                break;
            case 'crew':
                options.parts = ['crewHeader', 'crewTabs', 'crewRoster', 'crewTurn', 'crewWorlds'];
                break;
        }
    }

    /**
     * v13: Replaces getData()
     * Extends mixin context with actor-specific data.
     * @inheritDoc
     */
    async _prepareContext(options) {
        // Mixin provides: config, cssClass, isEditable, system, data
        const context = await super._prepareContext(options);

        // Actor-specific context
        context.actor = this.document;
        const ownedItems = this.document.items;

        if (this.document.type === "character" || this.document.type === "enemy") {
            context.weapons = ownedItems.filter(item => item.type === "weapon");
            context.gear = ownedItems.filter(item => item.type === "gear");
            context.backgrounds = ownedItems.filter(item => item.type === "background");
            context.motivations = ownedItems.filter(item => item.type === "motivation");
            context.class = ownedItems.filter(item => item.type === "class");
            context.gearCount = context.gear.length - 1;
        }

        if (this.document.type === "crew") {
            context.assignedCrew = this._buildCrewData(ownedItems);
            context.active_world = ownedItems.filter(item => item.type === "world" && item.system.active);
            context.worlds = ownedItems.filter(item => item.type === "world");
            context.battles = ownedItems.filter(item => item.type === "battle");
            context.jobs = ownedItems.filter(item => item.type === "patron_job");
            // Prepare tabs with active state for crew sheet
            context.tabs = this._prepareTabs("primary");
        }

        context.auto = false;

        return context;
    }

    /**
     * Prepare context for a specific template part.
     * Provides part-specific data enrichment.
     * @param {string} partId - The part identifier
     * @param {object} context - The existing context from _prepareContext
     * @param {object} options - Render options
     * @returns {Promise<object>} Enriched context for the part
     * @protected
     */
    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);

        switch (partId) {
            // Character parts
            case 'characterHeader':
                context.chartype = 'character';
                break;
            case 'characterStats':
            case 'characterItems':
            case 'characterNotes':
                // Data already in context from _prepareContext
                break;

            // Enemy parts
            case 'enemyHeader':
                context.chartype = 'enemy';
                break;
            case 'enemyStats':
            case 'enemyItems':
            case 'enemyNotes':
                // Data already in context from _prepareContext
                break;

            // Crew parts
            case 'crewHeader':
                break;
            case 'crewTabs':
                // tabs already prepared in _prepareContext via _prepareTabs
                break;
            case 'crewRoster':
                // Pass tab state for visibility
                context.tab = context.tabs?.main;
                break;
            case 'crewTurn':
                // Pass tab state for visibility
                context.tab = context.tabs?.turn;
                break;
            case 'crewWorlds':
                // Pass tab state for visibility
                context.tab = context.tabs?.worlds;
                break;
        }

        return context;
    }

    /**
     * v13: Called after render, replaces activateListeners
     */
    _onRender(context, options) {
        super._onRender(context, options);

        // Get the element - in v13, this.element is the application element
        const html = this.element;
        if (!html) return;

        // Tab click handling for crew sheet
        if (this.document.type === "crew") {
            html.querySelectorAll('nav.tabs a[data-tab]').forEach(tab => {
                tab.addEventListener('click', (event) => {
                    event.preventDefault();
                    const tabId = tab.dataset.tab;
                    const group = tab.dataset.group || "primary";
                    this.changeTab(tabId, group);
                });
            });
        }

        // Only bind editing handlers if editable
        if (!this.isEditable) return;

        // Inline editing - using native DOM
        html.querySelectorAll('.inline-edit-notes').forEach(el => {
            el.addEventListener('blur', this._inlineEditNotes.bind(this));
        });

        html.querySelectorAll('.inline-edit').forEach(el => {
            el.addEventListener('blur', this._inlineEdit.bind(this));
        });

        // Drag-drop setup for items
        const handler = (ev) => this._onDragStart(ev);
        html.querySelectorAll('.item-name').forEach(item => {
            if (item.dataset?.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });
    }

    // ===== Static Action Handlers (v13 pattern) =====

    /**
     * Handle creating a new embedded item
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     * @returns {Promise<Item|undefined>} The created item or undefined
     */
    static async #onCreateItem(event, target) {
        event.preventDefault();
        const type = target.dataset.type;
        const itemData = {
            name: game.i18n.localize("FP.ui.item.new"),
            type: type
        };
        return Item.create(itemData, { parent: this.document, renderSheet: true });
    }

    /**
     * Handle editing an embedded item or linked crew actor
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onEditItem(event, target) {
        event.preventDefault();
        const itemRow = target.closest(".item");
        const itemId = itemRow?.dataset.itemId;
        const crewId = itemRow?.dataset.crewId;
        const dataType = target.dataset.type;

        if (dataType === "crew_actor" && crewId) {
            const actorToEdit = game.actors.get(crewId);
            actorToEdit?.sheet.render(true);
        } else if (itemId) {
            const item = this.document.items.get(itemId);
            item?.sheet.render(true);
        }
    }

    // deleteItem action is now provided by ApplicationV2Mixin

    /**
     * Handle dice rolling from sheet buttons
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onDiceRoll(event, target) {
        event.preventDefault();
        const expr = target.dataset.diceBase;
        let imageSet = "d6";

        if (expr === "Reaction Roll") {
            ui.notifications.warn("Reaction Roll not implemented yet.");
        } else if (expr === "custom") {
            const template = "systems/fiveparsecs/templates/roll/customroll.hbs";
            const data = { actor: this.document, rollType: "custom" };
            FPRollUtility.customRoll(template, data);
        } else {
            const template = "systems/fiveparsecs/templates/roll/basicroll.hbs";
            if (expr === "1d10") imageSet = "d10";
            else if (expr === "1d100") imageSet = "d100";

            const data = {
                actor: this.document,
                expr: expr,
                rollType: "basic",
                imgs: imageSet
            };
            FPRollUtility.basicRoll(template, data);
        }
    }

    /**
     * Handle attack roll with weapon
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onAttackRoll(event, target) {
        event.preventDefault();
        const wpnId = target.dataset.weaponId;
        const baseDie = "d6";
        const template = "systems/fiveparsecs/templates/roll/attackroll.hbs";

        let data;
        if (wpnId === "brawl") {
            data = {
                a_name: this.document.name,
                a_combat: this.document.system.combat,
                w_name: "Brawl",
                w_range: "Melee",
                w_shots: 1,
                w_traits: "",
                w_dmg: "As weapon",
                die: baseDie
            };
        } else {
            const selectedWeapon = this.document.items.get(wpnId);
            if (!selectedWeapon) return;

            data = {
                a_name: this.document.name,
                a_combat: this.document.system.combat,
                w_name: selectedWeapon.name,
                w_range: selectedWeapon.system.range,
                w_shots: selectedWeapon.system.shots,
                w_traits: selectedWeapon.system.traits,
                w_dmg: selectedWeapon.system.damage,
                die: baseDie
            };
        }

        FPRollUtility.attackRoll(template, data);
    }

    /**
     * Handle refreshing crew roster display
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onRefreshCrew(event, target) {
        event.preventDefault();
        this.render(true);
    }

    /**
     * Handle editing a crew member or toggling crew status flags
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onEditCrewMember(event, target) {
        const itemRow = target.closest(".item");
        const crewId = itemRow?.dataset.crewId;
        const passthruAction = target.dataset.crewAction;

        if (!crewId) return;

        const actorToEdit = game.actors.get(crewId);
        if (!actorToEdit) return;

        if (passthruAction === "toggle_captain") {
            await actorToEdit.update({ "system.captain": !actorToEdit.system.captain });
            this.render(true);
        } else if (passthruAction === "toggle_casualty") {
            await actorToEdit.update({ "system.casualty": !actorToEdit.system.casualty });
            this.render(true);
        }
    }

    /**
     * Handle campaign turn phase actions
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     * @returns {Promise<void>} Result of the campaign step action
     */
    static async #onCampaignStep(event, target) {
        event.preventDefault();
        const phase = target.dataset.ctPhase;
        const action = target.dataset.ctAction;

        switch (phase) {
            case "flee-invasion":
                return this.document.handleFleeInvasion();
            case "arrival":
                if (action === "arrive-known-world") {
                    return this.document.selectKnownWorld();
                } else if (action === "clear-arrival") {
                    return this.document.clearArrival();
                }
                return this.document.handleArrival(action);
            case "upkeep": {
                const template = "systems/fiveparsecs/templates/roll/upkeepdialog.hbs";
                const upkeepData = {
                    actor: this.document,
                    credits: this.document.system.credits
                };
                return FPRollUtility.upkeepDialog(template, upkeepData);
            }
            case "crew_tasks": {
                const template = "systems/fiveparsecs/templates/roll/crewtaskdialog.hbs";
                const crewTaskData = {
                    actor: this.document,
                    crew_names: this.document.system.members,
                    auto: false
                };
                return FPRollUtility.crewTaskDialog(template, crewTaskData);
            }
            case "jobs":
                return this.document.addJob();
            case "battles":
                return this.document.addBattle();
            case "post": {
                const template = "systems/fiveparsecs/templates/roll/postbattledialog.hbs";
                const postData = { actor: this.document, auto: false };
                return FPRollUtility.postBattle(template, postData);
            }
            case "travel":
                return this.document.handleTravel();
        }
    }

    /**
     * Handle resetting campaign turn with optional logging
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onResetTurn(event, target) {
        event.preventDefault();
        const log = target.dataset.logging;
        const message = log === "yes"
            ? "This will log this campaign to your Journals, and then clear this campaign turn. Are you sure?"
            : "This will clear this Campaign Turn without logging anything. Are you sure?";

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are You Sure?" },
            content: message,
            yes: { label: "Continue" },
            no: { label: "Cancel" }
        });

        if (confirmed) {
            return this.document.resetCampaignTurn(log);
        }
    }

    /**
     * Handle changing actor image. Delegates to the Tokenizer module when it is
     * active and enabled, otherwise falls back to the core FilePicker.
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onChangeImage(event, target) {
        event.preventDefault();

        // Use the Tokenizer module (vtta-tokenizer) when it is active so the user
        // can edit both the avatar and the prototype token. Tokenizer's own
        // avatar-click binding only targets [data-edit="img"] elements, which our
        // sheets do not use, so we delegate explicitly. Holding Shift bypasses
        // Tokenizer and falls back to the core FilePicker.
        const tokenizerApi = game.modules.get("vtta-tokenizer")?.api;
        if (tokenizerApi?.tokenizeActor && !event.shiftKey) {
            return tokenizerApi.tokenizeActor(this.document);
        }

        const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;
        const fp = new FilePickerImpl({
            type: "image",
            current: this.document.img,
            callback: async (path) => {
                await this.document.update({ img: path });
            }
        });
        fp.render(true);
    }

    /**
     * Handle setting a world as the active arrival from Known Worlds tab
     * @this {FPActorSheet}
     * @param {PointerEvent} event - The triggering click event
     * @param {HTMLElement} target - The element that triggered the action
     */
    static async #onSetArrival(event, target) {
        event.preventDefault();
        const itemRow = target.closest("[data-item-id]");
        const worldId = itemRow?.dataset.itemId;

        if (worldId) {
            await this.document.setWorldAsArrival(worldId);
        }
    }

    // ===== Instance Methods =====

    _inlineEditNotes(event) {
        event.preventDefault();
        const element = event.currentTarget;
        return this.document.update({ "system.notes": element.innerText });
    }

    _inlineEdit(event) {
        event.preventDefault();
        const element = event.currentTarget;
        let attribute = element.dataset.field;

        // Convert old data.data paths to system paths
        if (attribute.startsWith("data.data.")) {
            attribute = attribute.replace("data.data.", "system.");
        } else if (attribute.startsWith("data.")) {
            attribute = attribute.replace("data.", "system.");
        }

        return this.document.update({ [attribute]: element.innerText });
    }

    _buildCrewData(ownedItems) {
        const crewRoster = [];
        const crewRosterNames = [];
        const assignedCrew = ownedItems.filter(item => item.type === "crew_assignment");

        if (!Array.isArray(assignedCrew) || assignedCrew.length === 0) {
            console.log("No assigned crew");
            return [];
        }

        assignedCrew.forEach(crew => {
            // v13: Use .id and .system
            const crewActor = game.actors.get(crew.system.assigned_crew_actorId);
            if (!crewActor) return;

            crewRosterNames.push(crewActor.name);
            const mbr_weapons = {};
            const gList = [];

            // Build object with basic crewmember info
            const crewMemberData = {
                mbr_item_id: crew.id,
                mbr_name: crewActor.name,
                mbr_id: crewActor.id,
                mbr_species: crewActor.system.species,
                mbr_reactions: crewActor.system.reactions,
                mbr_speed: crewActor.system.speed,
                mbr_combat: crewActor.system.combat,
                mbr_toughness: crewActor.system.toughness,
                mbr_savvy: crewActor.system.savvy,
                mbr_notes: crewActor.system.notes,
                mbr_luck: crewActor.system.luck,
                mbr_xp: crewActor.system.xp,
                mbr_casualty: crewActor.system.casualty,
                mbr_captain: crewActor.system.captain,
                mbr_sick: crewActor.system.sickbay_time,
                mbr_save: crewActor.system.save
            };

            const crewMemberWeps = crewActor.items.filter(item => item.type === "weapon");
            crewMemberWeps.forEach(wep => {
                mbr_weapons[wep.name] = {
                    name: wep.name,
                    range: wep.system.range,
                    shots: wep.system.shots,
                    dmg: wep.system.damage,
                    traits: wep.system.traits
                };
            });

            const crewMemberGear = crewActor.items.filter(item => item.type === "gear");
            crewMemberGear.forEach(gear => gList.push(gear.name));

            crewMemberData.mbr_gear = gList.toString();
            crewMemberData.mbr_weapons = mbr_weapons;
            crewRoster.push(crewMemberData);
        });

        // Update crew members list
        if (crewRosterNames.length > 0) {
            this.document.update({ "system.members": crewRosterNames });
        }

        return crewRoster;
    }
}
