// Imports
import { preloadHandlebarsTemplates } from "./templates.mjs";
import { registerSettings } from "./settings.mjs";
import { FP } from "./config.mjs";
import { FPActor } from "./actor/FPActor.mjs";
import { FPActorSheet } from "./sheets/actor/FPActorSheet.mjs";
import { FPItemSheet } from "./sheets/item/FPItemSheet.mjs";

// DataModel imports
import {
    CharacterDataModel,
    EnemyDataModel,
    CrewDataModel,
    WeaponDataModel,
    GearDataModel,
    BackgroundDataModel,
    ClassDataModel,
    MotivationDataModel,
    CrewAssignmentDataModel,
    WorldDataModel,
    PatronJobDataModel,
    BattleDataModel
} from "./data/_module.mjs";

Hooks.once("init", () => {
    console.log("fiveparsecs | Initializing Five Parsecs System for Foundry v13");

    CONFIG.fiveparsecs = FP;

    // Register DataModels for Actors
    CONFIG.Actor.dataModels = {
        character: CharacterDataModel,
        enemy: EnemyDataModel,
        crew: CrewDataModel
    };

    // Register DataModels for Items
    CONFIG.Item.dataModels = {
        weapon: WeaponDataModel,
        gear: GearDataModel,
        background: BackgroundDataModel,
        class: ClassDataModel,
        motivation: MotivationDataModel,
        crew_assignment: CrewAssignmentDataModel,
        world: WorldDataModel,
        patron_job: PatronJobDataModel,
        battle: BattleDataModel
    };

    // Add namespace in global
    game.FP = {
        FPActor,
        FPActorSheet,
        FPItemSheet,
        registerSettings
    };

    // Register document classes
    CONFIG.Actor.documentClass = FPActor;

    // Register System sheets using v13 API
    foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "fiveparsecs", FPActorSheet, {
        types: ["character", "enemy", "crew"],
        makeDefault: true,
        label: "FP.sheet.actor"
    });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "fiveparsecs", FPItemSheet, {
        types: ["weapon", "gear", "background", "class", "motivation", "crew_assignment", "world", "patron_job", "battle"],
        makeDefault: true,
        label: "FP.sheet.item"
    });

    // Register system settings
    registerSettings();

    // Register partials templates
    preloadHandlebarsTemplates();

    // Register handlebar helpers
    Handlebars.registerHelper('ife', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("times", function(n, content) {
        let result = "";
        if (n == 0 || n == null) return;
        for (let i = 0; i < n; i++) {
            result += content.fn(i);
        }
        return result;
    });

    Handlebars.registerHelper("proper", function(content) {
        if (!content) return "";
        return content[0].toUpperCase() + content.substring(1);
    });

    Handlebars.registerHelper("minus", function(arg1, arg2) {
        return arg1 - arg2;
    });

    Handlebars.registerHelper("render", function(arg1) {
        return new Handlebars.SafeString(arg1);
    });

    Handlebars.registerHelper("setting", function(arg) {
        if (arg == "" || arg == "non" || arg == undefined) { return; }
        return game.settings.get('fiveparsecs', arg);
    });

    Handlebars.registerHelper("concat", function(...args) {
        let result = "";
        for (let a of args) {
            if (typeof a === 'string') result += a;
        }
        return result;
    });

    Handlebars.registerHelper("getCustomName", function(a) {
        if (a == "none" || a == "None" || a == "") { return; }
        let result = "Name";
        let truncA = a.substring(0, 3);
        result = truncA + result;
        return result;
    });

    Handlebars.registerHelper("and", function(a, b) {
        return (a && b);
    });

    Handlebars.registerHelper("or", function(a, b) {
        return (a || b);
    });

    Handlebars.registerHelper("contains", function(a, b) {
        if (!a || typeof a.indexOf !== 'function') return false;
        return a.indexOf(b) !== -1;
    });
});

/**
 * Item Hooks - v13 signature: (document, changes, options, userId)
 */
Hooks.on('updateItem', function(item, changes, options, userId) {
    // Handle item updates
});

Hooks.on('deleteItem', function(item, options, userId) {
    // Handle item deletion
});

/**
 * Chat Display Hooks - v13: html is plain DOM element
 */
Hooks.on('renderChatMessageHTML', (message, html, data) => {
    // Add event listeners using native DOM API if needed
});

/**
 * Initiative / Combat Hooks - v13 signature
 */
Hooks.on('updateCombatant', function(combatant, changes, options, userId) {
    console.log("Combat update: ", combatant);
});

/**
 * Actor / Token Hooks - v13 signature
 */
Hooks.on('updateToken', function(token, changes, options, userId) {
    console.log("Updating Token: ", token.name, token.id);
});

/**
 * preCreateItem hook - v13 signature
 */
Hooks.on('preCreateItem', function(item, data, options, userId) {
    if (item.type === "weapon") {
        item.updateSource({ img: "icons/svg/sword.svg" });
    }
});

/**
 * Sheet close hook - update crew rosters when character sheets close
 */
Hooks.on('closeActorSheet', function(sheet, html) {
    const sheetActorId = sheet.actor.id;

    let allOwnedCrewAssignments = [];
    const allCrews = game.actors.filter(a => a.type === "crew");

    allCrews.forEach(c => {
        let crewItems = c.items.filter(i => i.type === "crew_assignment");
        crewItems.forEach(ci => allOwnedCrewAssignments.push(ci));
    });

    // v13: Use .system instead of .data.data
    let thisActorAssignments = allOwnedCrewAssignments.filter(
        (a) => a.system.assigned_crew_actorId === sheetActorId
    );

    thisActorAssignments.forEach(a => {
        let parentCrew = a.parent;
        parentCrew.sheet.render(false);
    });
});
