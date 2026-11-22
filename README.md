# Alchemist (Dragon #49) for 1e FRPG, v0.2.0

An optional class module for the 1e FRPG system for Foundry VTT (system 0.37.0 or later). It adds the alchemist: a lawful kind of magic-user who makes potions and poisons, identifies and analyzes potions, and casts a small list of spells of his or her own. The article makes alchemists non-player characters only, met in towns or hired as henchmen. Turn the module on or off in Manage Modules.

Based on Lenard Lakofka's article "A recipe for the Alchemist" (Leomund's Tiny Hut, Dragon #49, May 1981, p.56-60). The rules are restated in plain words; the numbers (the alchemists table, the abilities chart, the potion and poison tables, and the spell list) follow the article. You need the article for its original text.

## Install

In Foundry's Setup screen, go to Add-on Modules, Install Module, and paste this manifest URL:

`https://github.com/gmjeremynow/frpg1e-alchemist/releases/latest/download/module.json`

## What it adds

- The class "Alchemist (Dragon #49)": titles Potter to Grandmaster, the article's experience table (to 11th), hit points by the article's table (1, 1+2, 2+2 ... 7+8 on d4), spells by level, magic-user attacks, magic-user saves 2 worse except vs. spells, and spells cast at the "magic level" (the number of dice, at most 7).
- Its own spell list, "Alchemist", and a compendium of the 48 printed spells plus read magic: PHB spells copied from the system (magic-user, cleric or druid), the altered ones with the article's changes, and the new ones written out (identify minerals, stir, wizard glue, identify potion, identify plants, preserve, identify poison, find plants, transmute rock to ore). Find familiar has the alchemist's familiar table as a roll.
- An Alchemist tab: magic level, what intelligence allows, a familiar setting (+5% or −5% to every chance), every ability on the chart with a Roll button (failed potions read on the result table), the analysis explosion check, mixture analysis from 9th level, poison making by type, the special notes A-I by level, and reminders.
- Record tab notes, which never block anything: ability scores out of range, a race or level not allowed, more than one class, not lawful at 6th level or more, magic armor or bracers of defense worn.
- A compendium with the article restated in plain words: requirements, experience awards, the tables, potions by difficulty, failed potions, poisons, magic-users and alchemy, and business.

## Choices made here

- Proficiency slots, which the article doesn't give, are the magic-user's (1 weapon and 3 nonweapon, then 1 weapon and 2 nonweapon every 6 levels), with −5 when not proficient. The article allows only the dagger and the dart.
- A potion roll that fails the chart is read on the failure table with the level modifier. From 5th level up, the table's "Success" range plus the modifier is exactly the chart's first difficulty chance, so on a failed roll "Success" can only come up at 4th level or for a harder potion; the module reads it as complete failure.
- Armor: the article bars magic armor of any type, bracers of defense included, and says nothing about ordinary armor, so only magic armor and bracers are noted.
- Magic missile is printed "(4)", and the article's example says an alchemist gets four missiles, so it always gives four.
- Shrink is taken as the reverse of enlarge (reduce in the PHB); its entry carries the enlarge text.
- Leomund's trap and Tenser's floating disk use the system's names, false trap and floating disc.
- Read magic is not on the spell list, but every Apprentice is taught it, so it is in the compendium.

## Kept as printed

- 5th level, second difficulty is printed "2 0%" (20%).
- Lethal poison at 11th level is printed 96% on the abilities chart, though the poison table with its level modifier gives 100%. The tab's chart roll for lethal poison uses 96%; the Poisons box, which rolls on the poison table, gives 100%.
