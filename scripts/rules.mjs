/**
 * The alchemist (Lenard Lakofka, "A recipe for the Alchemist", Leomund's Tiny Hut, Dragon #49 (vol. V no. 11), May 1981, p.56-60).
 * Pure data and functions, no Foundry calls, so the tests can load it directly.
 */
export const KEY = "alchemist";
export const LIST = "alchemist";
export const MID = "frpg1e-alchemist";
export const SRC = "Dragon #49 p.56-60";

/** Alchemists table (p.57): [level, title, 4-sided dice + fixed hit points ("magic level" = dice), experience, special note]. */
export const LEVELS = [null,
  [1, "Potter", 1, 0, 0, "A"], [2, "Glassblower", 1, 2, 1001, "B"], [3, "Apprentice", 2, 2, 3201, "C"], [4, "Brewer", 2, 4, 6001, "D"],
  [5, "Alember", 2, 6, 10001, "E"], [6, "Identifier", 3, 6, 18501, "F"], [7, "Scholar", 4, 6, 30001, "G"], [8, "Graduate", 4, 8, 50001, "H"],
  [9, "Alchemist", 5, 8, 75001, "I"], [10, "Master", 6, 8, 110001, ""], [11, "Grandmaster", 7, 8, 200001, ""]];
export const MAX_LEVEL = 11;
export const row = L => LEVELS[Math.min(MAX_LEVEL, Math.max(1, L))];
export const magicLevel = L => row(L)[2];
export const hpText = L => { const r = row(L); return r[3] ? `${r[2]}+${r[3]}` : `${r[2]}`; };
/** Dice and fixed hit points gained at a level (the difference from the row before). */
export function levelHD(L) {
  if (L > MAX_LEVEL) return { dice: 0, fixed: 0 };
  const r = row(L), p = L > 1 ? row(L - 1) : [0, "", 0, 0];
  return { dice: r[2] - p[2], fixed: r[3] - p[3] };
}

/** Spells learnable by level (p.57). */
export const SPELLS = { 3: [1], 4: [2], 5: [3], 6: [4, 1], 7: [4, 2, 1], 8: [4, 3, 2], 9: [4, 3, 3, 1], 10: [4, 4, 3, 2, 1], 11: [4, 4, 4, 2, 2] };
/** Intelligence needed (p.56-57): spell level -> int; potion difficulty -> int. */
export const SPELL_INT = { 1: 10, 2: 10, 3: 12, 4: 14, 5: 16 };
export const POTION_INT = { 1: 10, 2: 12, 3: 14, 4: 16 };

/** Alchemists abilities chart (p.56). null = cannot. Columns as ABILITY_KEYS. */
export const ABILITY_KEYS = ["pottery", "glass", "test", "known", "unknown", "mild", "toxic", "lethal", "destructive", "p1", "p2", "p3", "p4"];
export const ABILITY_LABELS = { pottery: "Craft pottery", glass: "Craft glass", test: "“10% test” of a known potion", known: "Analysis of a known potion",
  unknown: "Analysis of an unknown potion", mild: "Mild poison", toxic: "Toxic poison", lethal: "Lethal poison", destructive: "Destructive poison",
  p1: "Potion, first difficulty", p2: "Potion, second difficulty", p3: "Potion, third difficulty", p4: "Potion, fourth difficulty" };
const _ = null;
export const ABILITIES = [null,
  [93, _, _, _, _, _, _, _, _, _, _, _, _], [94, 70, _, _, _, _, _, _, _, _, _, _, _], [95, 75, 60, _, _, _, _, _, _, _, _, _, _],
  [96, 80, 65, _, _, _, _, _, _, 15, _, _, _], [97, 85, 70, _, _, _, _, _, _, 25, 20, 15, 10], [98, 90, 75, _, _, _, _, _, _, 48, 35, 29, 23],
  [99, 95, 80, _, _, 65, 48, 36, 27, 71, 50, 43, 36], [100, 100, 85, 85, 60, 81, 64, 52, 43, 94, 65, 57, 49],
  [100, 100, 90, 91, 70, 97, 80, 68, 59, 100, 80, 71, 62], [100, 100, 95, 97, 80, 100, 96, 84, 75, 100, 95, 85, 75],
  [100, 100, 100, 100, 90, 100, 100, 96, 91, 100, 100, 99, 88]];
export function ability(L, key) {
  const r = ABILITIES[Math.min(MAX_LEVEL, Math.max(1, L))];
  return r[ABILITY_KEYS.indexOf(key)];
}

/** Potion failure results (p.58), alchemists only: [lo, hi, result, damage]. */
export const POTION_RESULT = [[1, 25, "Success", ""], [26, 45, "Complete failure", ""], [46, 50, "Explosion", "6d4"], [51, 60, "Half efficacy", ""],
  [61, 70, "Opposite effect", ""], [71, 90, "Mild poison", "5d4"], [91, 96, "Toxic poison", "5d6"], [97, 100, "Lethal poison (death unless a save is made; 4d6 damage in any case)", "4d6"]];
export const NONALCH_RESULT = [[1, 15, "Success"], [16, 50, "Complete failure"], [51, 58, "Explosion (6d4)"], [59, 64, "Half efficacy"], [65, 79, "Opposite effect"],
  [80, 90, "Mild poison (5d4)"], [91, 96, "Toxic poison (5d6)"], [97, 100, "Lethal poison (death unless a save; 4d6 in any case)"]];
/** Subtract 23 for each level above 5th (p.58). */
export const potionMod = L => Math.max(0, L - 5) * 23;
export const potionResult = n => POTION_RESULT.find(([a, b]) => n >= a && n <= b);

/** Poisons (p.58): [key, label, failed save, successful save, save modifier, success to, failure to (rest half efficacy)]. */
export const POISONS = [
  ["iA", "Ingested, mild (A)", "5d4", "2d4", 2, 65, 88], ["iB", "Ingested, toxic (B)", "5d6", "3d4", 1, 48, 84], ["iC", "Ingested, toxic (C)", "5d8", "5d4", 0, 40, 84],
  ["iD", "Ingested, lethal (D)", "Death", "4d6", 0, 36, 75], ["iE", "Ingested, destructive (E)", "Death", "5d6", -1, 27, 68],
  ["nA", "Insinuative A", "4d4", "0", 1, 70, 90], ["nB", "Insinuative B", "4d6", "0", 0, 55, 92], ["nC", "Insinuative C", "4d10", "0", -1, 37, 84],
  ["nD", "Insinuative D", "Death", "0", 0, 27, 78]];
export const HALF_INSINUATIVE = { nA: "2d4", nB: "2d6", nC: "2d10", nD: "2d12" };
/** Subtract 16 for each level above 7th (p.58). */
export const poisonMod = L => Math.max(0, L - 7) * 16;
export function poisonResult(key, n) {
  const p = POISONS.find(x => x[0] === key);
  return !p ? null : n <= p[5] ? "Success" : n <= p[6] ? "Failure" : "Half efficacy";
}

/** Analysis (H): explosion 10%, 2% less a level above 8th; 4d4. Mixture (I): 70/80/90% accuracy, explosion 20/15/10% for 4d6. */
export const analysisExplosion = L => Math.max(0, 10 - 2 * Math.max(0, L - 8));
export const MIXTURE = { 9: [70, 20], 10: [80, 15], 11: [90, 10] };

export const MINIMUMS = { str: 9, int: 10, wis: 6, dex: 9, con: 14 };
export const MAX_CHA = 15;
/** Humans, elves and half-elves; only humans become masters and grandmasters. */
export function raceLimit(race) {
  const r = String(race ?? "");
  if (!r || r === "human") return null;
  if (r.startsWith("elf") || r.startsWith("half-elf")) return 9;
  return 0;
}

/** Magic-user to alchemist (p.58). */
export const MU_EQUIVALENT = [[11, 12, 8], [13, 14, 9], [15, 16, 10], [17, Infinity, 11]];

export function classDef() {
  return {
    label: "Alchemist (Dragon #49)", source: "Dragon #49", src: "Dragon #49", as: "magicuser",
    hitDie: 4, firstDice: 1, maxHD: 7, afterHP: 0, matrix: "magicuser", save: "magicuser",
    fighterCon: false, nonProf: -5, maxLevel: MAX_LEVEL,
    levelHD,
    spells: [{ list: LIST, progression: "alchemist", casterLevel: L => magicLevel(L) }],
    // proficiency slots as a magic-user (the article allows only the dagger and the dart)
    profSlots: [1, 3, 1, 2, 6],
    xp: LEVELS.slice(1).map(r => r[4])
  };
}
export const ord = n => `${n}${[, "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? "th"}`;
