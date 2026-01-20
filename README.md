# Five Parsecs from Home - Foundry VTT System

An unofficial Foundry VTT system for the **Five Parsecs from Home** solo/co-op tabletop wargame by Modiphius Entertainment.

## About

This system helps you manage your Five Parsecs campaigns digitally, providing interactive character sheets, crew tracking, and dice rolling support. It is designed to complement your physical rulebook, not replace it.

**Important**: This system does not automate the procedural tables from the rulebook (copyright restriction). You will still need your Five Parsecs from Home rulebook to play.

## Features

### Crew Management
- Track your crew's **credits**, **story points**, and **ship status**
- Manage **patrons** and **rivals** relationships
- Monitor ship **hull points**, **debt**, **traits**, and **upgrades**
- Store notes, rumors, and campaign events

### Character Sheets
- Full stat tracking: **Speed**, **Combat**, **Toughness**, **Reactions**, **Savvy**, **Luck**
- Experience points and captain designation
- Injury tracking with sickbay time
- Background, class, and motivation traits

### Campaign Turn Tracker
- **Travel Phase**: Track departures and travel events
- **Arrival Phase**: Monitor world arrivals and followers
- **Upkeep Phase**: Manage debt payments, payroll, ship repairs, and medical costs
- **Crew Tasks**: Record patron meetings, training, trading, recruiting, and exploration results
- **Post-Battle Phase**: Track rivals, patrons, quests, pay, loot, and campaign events

### Equipment & Items
- **Weapons**: Range, shots, damage, and special traits
- **Gear**: Uses, effects, and descriptions
- **Worlds**: Track planets with their patrons and rivals
- **Patron Jobs** and **Battles**: Campaign progression tracking

### Dice Rolling
- Integrated dice roller with visual dice images
- Support for d4, d6, d8, d10, d12, and d20

## Data Import

The system supports bulk importing items (Weapons, Gear, Traits) from CSV or TSV (Tab-Separated) files.

### How to Import
1. Open the **Items Directory** in the right sidebar.
2. Click the **Import CSV** button at the bottom.
3. Select the **Item Type** you are importing.
4. (Optional) Select a **Target Folder**.
5. Choose your file and click **Import CSV**.

### Expected File Headers
The first row of your file must contain headers that match the system's fields. Headers are case-insensitive.

#### Common Headers (All Types)
- `name`: The name of the item.
- `notes`: Description or flavor text.
- `rules`: Mechanical rules text.
- `cost`: Credit cost (number).
- `img`: Path to an image file.

#### Weapons
- `range`: Weapon range in inches.
- `shots`: Number of shots.
- `damage`: Damage modifier.
- `traits`: Special weapon traits (e.g., "Pistol, Critical").

#### Gear
- `type`: The category of gear (e.g., "Armor", "Consumable").
- `uses`: Number of uses (0 for unlimited).
- `affects`: Who the gear affects (e.g., "Self", "Area").

#### Backgrounds, Classes, & Motivations
- `effect`: The mechanical effect granted.
- `resources`: Starting resources granted.
- `starting_rolls`: Any starting rolls provided.

## Credits

This system is based on the original implementation by **Waryjack**: [github.com/waryjack/fiveparsecs](https://github.com/waryjack/fiveparsecs)

Updated and maintained for Foundry VTT v13 compatibility.

## Disclaimer

This is an unofficial, fan-made system. Five Parsecs from Home is a product of Modiphius Entertainment. This project is not affiliated with or endorsed by Modiphius Entertainment.
