/**
 * Alchemist (Dragon #49) for 1e FRPG (Table Edition). An optional add-on: enable or disable it in Manage Modules.
 * Registers the alchemist and its spell list from "A recipe for the Alchemist" (Lenard Lakofka, Leomund's Tiny Hut,
 * Dragon #49, May 1981), adds an Alchemist tab, and builds world compendia with the spells and the rules.
 */
import * as AL from "./rules.mjs";
import { renderAlchemistTab } from "./sheet-tab.mjs";
import { offerImport, importCompendia } from "./compendia.mjs";

const MID = AL.MID;
let API = null;

Hooks.once("frpg1e.init", api => {
  API = api;
  if (!api.registerSpellList || !api.hideClasses) { console.error(`${MID} | needs 1e FRPG 0.37.0 or later`); return; }
  api.registerSpellList(AL.LIST, "Alchemist");
  api.registerSpellProgression("alchemist", AL.SPELLS);
  api.registerClass(AL.KEY, AL.classDef());
});

Hooks.once("init", () => {
  game.settings.register(MID, "compendiaVersion", { scope: "world", config: false, type: String, default: "" });
  game.settings.registerMenu(MID, "rebuild", { name: "Alchemist compendia", label: "Rebuild the alchemist compendia", icon: "fa-solid fa-book",
    type: class extends foundry.applications.api.ApplicationV2 { render() { importCompendia({ confirm: true }); return this; } }, restricted: true });
  game.alchemist = { importCompendia, rules: AL };
});

Hooks.once("ready", () => {
  if (!API?.registerSpellList) ui.notifications.error("Alchemist needs 1e FRPG (Table Edition) 0.37.0 or later.", { permanent: true });
  else if (game.user.isGM) offerImport();
});

/** Saves as a magic-user at −2, except vs. spells; requirement notes on the Record tab. */
export function prepareAlchemist(sys, items = []) {
  const classes = sys.classInfo ?? [];
  const c = classes.find(x => x.key === AL.KEY);
  if (!c) return;
  const R = globalThis.game?.frpg1e?.Rules;
  const L = Math.max(1, c.level ?? 1);
  if (R?.SAVE_KEYS && sys.saves) {
    for (const k of R.SAVE_KEYS) {
      if (k === "sp" || !sys.saves[k]) continue;
      const s = sys.saves[k];
      const base = R.saveRow("magicuser", L)[k] + 2;
      s.value += base - s.base;
      s.base = base;
    }
  }
  const notes = sys.settingNotes ?? (sys.settingNotes = []);
  const T = "Alchemist (Dragon #49)";
  const ab = sys.abilities ?? {};
  const low = Object.entries(AL.MINIMUMS).filter(([k, m]) => (ab[k]?.value ?? 0) < m).map(([k, m]) => `${k.toUpperCase()} ${m}`);
  if (low.length) notes.push(`${T}: below the minimum ability scores (${low.join(", ")}).`);
  if ((ab.cha?.value ?? 0) > AL.MAX_CHA) notes.push(`${T}: charisma must be less than 16.`);
  const limit = AL.raceLimit(sys.details?.race);
  if (limit === 0) notes.push(`${T}: only humans, elves and half-elves can be alchemists.`);
  else if (limit && L > limit) notes.push(`${T}: only humans can become masters and grandmasters.`);
  if (L > AL.MAX_LEVEL) notes.push(`${T}: alchemists do not progress beyond Grandmaster (11th).`);
  if (classes.length > 1) notes.push(`${T}: an alchemist may never be multi-classed.`);
  const al = String(sys.details?.alignment ?? "").toLowerCase();
  if (L >= 6 && al && !/lawful|^l[gne]$/.test(al)) notes.push(`${T}: every alchemist has become lawful by 6th level (Identifier).`);
  const list = Array.isArray(items) ? items : [...(items ?? [])];
  // The article bars magic armor of any type, bracers of defense included; it says nothing of ordinary armor.
  for (const a of list.filter(i => i.system?.equipped && ((i.type === "armor" && (i.system.magic ?? 0) !== 0) || (i.type === "magic" && i.system.protection?.kind === "bracers"))))
    notes.push(`${T}: alchemists may not wear magic armor of any type, bracers of defense included (${a.name}).`);
}
Hooks.on("frpg1e.prepareCharacter", (sys, items) => prepareAlchemist(sys, items));
Hooks.on("renderCharacterSheet", (app, element) => renderAlchemistTab(app, element));
