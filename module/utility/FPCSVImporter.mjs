const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * CSV/TSV item importer - v14 ApplicationV2.
 * Converted from the legacy FormApplication to AppV2 to remove the
 * AppV1 deprecation warning under Foundry v14.
 */
export class FPCSVImporter extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "fp-csv-importer",
        tag: "form",
        classes: ["fp", "fp-csv-importer"],
        window: {
            title: "FP.Importer.Title"
        },
        position: {
            width: 400,
            height: "auto"
        },
        form: {
            handler: FPCSVImporter.#onSubmit,
            closeOnSubmit: true
        }
    };

    static PARTS = {
        form: { template: "systems/fiveparsecs/templates/apps/csv-import.hbs" }
    };

    /**
     * v14: Replaces getData()
     */
    async _prepareContext(options) {
        const folders = game.folders.filter(f => f.type === "Item");
        const types = ["weapon", "gear", "background", "motivation", "class"];
        return {
            folders,
            types
        };
    }

    /**
     * AppV2 form submit handler.
     * @this {FPCSVImporter}
     * @param {SubmitEvent} event
     * @param {HTMLFormElement} form
     * @param {FormDataExtended} formData
     */
    static async #onSubmit(event, form, formData) {
        const data = formData.object;

        // File inputs are not captured by FormDataExtended; read from the element.
        const input = form.elements["csv-file"];
        const actualFile = input?.files?.[0];

        if (!actualFile) {
            ui.notifications.error(game.i18n.localize("FP.Importer.Error").replace("{message}", "No file selected"));
            return;
        }

        const text = await actualFile.text();
        const type = data.type;
        const targetFolder = data.folder;
        const format = data.format;

        try {
            const rows = this.parseCSV(text, format);
            await this.createItems(rows, type, targetFolder);
            ui.notifications.info(game.i18n.localize("FP.Importer.Success").replace("{count}", rows.length));
        } catch (err) {
            console.error(err);
            ui.notifications.error(game.i18n.localize("FP.Importer.Error").replace("{message}", err.message));
        }
    }

    parseCSV(text, format) {
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
        if (lines.length === 0) return [];

        let delimiter = ",";
        if (format === "tsv") delimiter = "\t";
        else if (format === "auto") {
            // Simple auto-detection: count tabs in first line
            const tabs = (lines[0].match(/\t/g) || []).length;
            const commas = (lines[0].match(/,/g) || []).length;
            delimiter = tabs > commas ? "\t" : ",";
        }

        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/^["'](.+)["']$/, '$1'));
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const row = this._splitLine(lines[i], delimiter);
            const obj = {};

            headers.forEach((h, index) => {
                if (row[index] !== undefined) {
                    let val = row[index].trim();
                    // Remove surrounding quotes
                    val = val.replace(/^["'](.+)["']$/, '$1');
                    obj[h] = val;
                }
            });
            result.push(obj);
        }
        return result;
    }

    _splitLine(line, delimiter) {
        if (delimiter === "\t") return line.split("\t");

        // CSV logic with quotes
        const result = [];
        let cur = "";
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === delimiter && !inQuote) {
                result.push(cur);
                cur = "";
            } else {
                cur += char;
            }
        }
        result.push(cur);
        return result;
    }

    async createItems(rows, type, folderId) {
        const mapping = this.getMapping(type);
        const toCreate = [];

        for (const row of rows) {
            const itemData = {
                name: "New Item",
                type: type,
                img: "icons/svg/item-bag.svg",
                system: {},
                folder: folderId || null
            };

            for (const [csvHeader, systemPath] of Object.entries(mapping)) {
                const value = row[csvHeader];
                if (value !== undefined && value !== "") {
                    if (systemPath === "name") itemData.name = value;
                    else if (systemPath === "img") itemData.img = this.resolveImage(value);
                    else foundry.utils.setProperty(itemData, systemPath, this.cleanValue(value));
                }
            }

            toCreate.push(itemData);
        }

        if (toCreate.length > 0) {
            return await Item.createDocuments(toCreate);
        }
        return [];
    }

    getMapping(type) {
        const common = {
            "name": "name",
            "img": "img",
            "image": "img",
            "notes": "system.notes",
            "cost": "system.cost",
            "rules": "system.rules"
        };

        const traitCommon = {
            ...common,
            "effect": "system.effect",
            "resources": "system.resources",
            "starting_rolls": "system.starting_rolls"
        };

        const mappings = {
            weapon: {
                ...common,
                "range": "system.range",
                "shots": "system.shots",
                "damage": "system.damage",
                "traits": "system.traits"
            },
            gear: {
                ...common,
                "type": "system.geartype",
                "uses": "system.uses",
                "affects": "system.affects"
            },
            background: traitCommon,
            class: traitCommon,
            motivation: traitCommon
        };

        return mappings[type] || common;
    }

    resolveImage(imgVal) {
        if (!imgVal) return "icons/svg/item-bag.svg";

        // If it looks like w49, w27 etc.
        if (/^[a-z]\d+$/.test(imgVal)) {
            // Check if we have a mapping or just default.
            // PRP says "does not match existing assets".
            return "icons/svg/item-bag.svg";
        }

        // If it looks like a path, keep it
        if (imgVal.includes("/")) return imgVal;

        return "icons/svg/item-bag.svg";
    }

    cleanValue(val) {
        if (!isNaN(val) && val.trim() !== "") {
            return Number(val);
        }
        if (val.toLowerCase() === "yes" || val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "no" || val.toLowerCase() === "false") return false;
        return val;
    }
}
