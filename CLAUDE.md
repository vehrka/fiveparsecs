# Five Parsecs from Home (Foundry VTT System)

## Project Overview

This is an unofficial Foundry VTT system for the **Five Parsecs from Home** solo/co-op tabletop wargame. It provides character sheets, crew management, campaign tracking, and dice rolling features tailored to the game's mechanics.

**Type:** Foundry VTT System (JavaScript/HTML/CSS)
**Compatibility:** Foundry VTT v13+
**Architecture:** Standard Foundry System (ES Modules, Handlebars, CSS)

## Key Components

### File Structure
- **`system.json`**: The system manifest file defining metadata, document types, and entry points.
- **`module/`**: Contains the core JavaScript logic.
    - **`fiveparsecs.mjs`**: The main entry point. Initializes the system, registers sheets, and sets up hooks.
    - **`config.mjs`**: Defines system-wide constants and configuration (e.g., dice images).
    - **`data/`**: Contains `TypeDataModel` definitions for Actors and Items.
    - **`sheets/`**: Contains the logic for Actor and Item sheets.
    - **`utility/`**: Helper classes for rolling, procedural generation, and chat messages.
- **`templates/`**: Handlebars (`.hbs`) templates for rendering sheets and chat messages.
- **`styles/`**: CSS files for styling the system's UI.
- **`assets/`**: Images and icons used by the system (dice, symbols, etc.).

### Document Types
**Actors:**
- `character`: Individual crew members.
- `enemy`: Opponents encountered in battles.
- `crew`: Represents the player's group/ship.

**Items:**
- `weapon`: Weapons with stats.
- `gear`: General equipment.
- `background`, `class`, `motivation`: Character creation traits.
- `crew_assignment`: Links characters to crews.
- `world`: Campaign locations.
- `patron_job`: Mission tracking.
- `battle`: Encounter tracking.

## Development Conventions

### Coding Style
- **ES Modules**: The project uses native ES modules (`.mjs`).
- **Hooks**: Logic is often triggered via Foundry VTT hooks (e.g., `Hooks.on('init', ...)`).
- **Data Models**: Use Foundry's `TypeDataModel` for defining the schema of Actors and Items (Foundry VTT v10+ standard).
- **Naming**:
    - Classes: PascalCase (e.g., `FPActor`, `WeaponDataModel`).
    - Document Types: snake_case (e.g., `patron_job`, `crew_assignment`).

### Templating
- **Handlebars**: Used for all HTML generation.
- **Helpers**: Custom helpers are registered in `module/fiveparsecs.mjs` (e.g., `ife`, `times`, `render`).

## Building and Running

**Installation:**
This project is designed to be run directly within Foundry VTT.
1.  Place the `fiveparsecs` directory into your Foundry VTT `Data/systems/` folder.
2.  Restart Foundry VTT.
3.  Create a new world and select "Five Parsecs from Home" as the game system.

**Build Process:**
- There is no build step (no `package.json` or build scripts found).
- Files are edited directly and loaded by the browser/Foundry client.
- **Note:** Ensure you are testing with a Foundry VTT v13 instance as specified in `system.json`.

## TODO / Future Work
- Verify if any `package.json` exists for dev dependencies (linting, etc.) or if it is purely a "raw" system.
- Check `module/utility/FPProcGen.mjs` for implementation of procedural generation logic (or lack thereof, per README disclaimer).
