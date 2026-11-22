/** Alchemist tab on the character and NPC sheets: the abilities chart with rolls, potions, poisons and reminders. */
import * as AL from "./rules.mjs";

const MID = AL.MID;
const esc = s => (globalThis.foundry?.utils?.escapeHTML ? foundry.utils.escapeHTML(String(s ?? "")) : String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]));
const box = (title, body) => `<div class="box"><h3 class="box-title">${title}</h3>${body}</div>`;
const flag = (actor, k) => actor.getFlag?.(MID, k) ?? actor.flags?.[MID]?.[k];
/** Familiar: +5% to every chance with one, −5% after losing one (Find Familiar note). */
export const familiarMod = actor => ({ yes: 5, lost: -5 })[flag(actor, "familiar")] ?? 0;
const pct = (actor, n) => (n === null || n === undefined ? null : Math.max(0, Math.min(100, n + familiarMod(actor))));

export function renderAlchemistTab(app, element) {
  const root = element instanceof HTMLElement ? element : element?.[0] ?? app.element;
  const actor = app.actor ?? app.document;
  if (!root || !actor || !["character", "npc"].includes(actor.type)) return;
  const tabs = root.querySelector(".sheet-tabs"), scroll = root.querySelector(".tab-scroll");
  root.querySelector(".tab-body[data-tab='alchemist']")?.remove();
  tabs?.querySelector("[data-tab='alchemist']")?.remove();
  const html = tabHTML(actor);
  if (!tabs || !scroll || !html) return;
  const btn = document.createElement("button");
  btn.type = "button"; btn.dataset.action = "sheetTab"; btn.dataset.tab = "alchemist"; btn.textContent = "Alchemist";
  tabs.append(btn);
  const sec = document.createElement("section");
  sec.className = "tab-body al-tab"; sec.dataset.tab = "alchemist"; sec.innerHTML = html;
  scroll.append(sec);
  if (app._tab === "alchemist") { btn.classList.add("active"); sec.classList.add("active"); }
  sec.querySelector("[name='al-familiar']")?.addEventListener("change", ev => actor.setFlag(MID, "familiar", ev.currentTarget.value));
  sec.querySelectorAll("[data-al-roll]").forEach(b => b.addEventListener("click", () => rollAbility(actor, b.dataset.alRoll)));
  sec.querySelector("[data-al-poison]")?.addEventListener("click", () => rollPoison(actor, sec.querySelector("[name='al-poison']").value));
}

/** The tab's HTML, or "" when the actor has no alchemist class. */
export function tabHTML(actor) {
  const s = actor.system;
  const c = (s.classInfo ?? []).find(x => x.key === AL.KEY);
  if (!c) return "";
  const L = Math.max(1, Math.min(AL.MAX_LEVEL, c.level ?? 1));
  const [, title, , , , note] = AL.row(L);
  const int = s.abilities?.int?.value ?? 0;
  const fam = flag(actor, "familiar") ?? "";
  const out = [];
  const maxSpell = Object.entries(AL.SPELL_INT).filter(([, i]) => int >= i).map(([l]) => +l).pop() ?? 0;
  const maxPotion = Object.entries(AL.POTION_INT).filter(([, i]) => int >= i).map(([l]) => +l).pop() ?? 0;
  out.push(box(`Alchemist ${L}: ${esc(title)} <span class="hint">(${AL.SRC})</span>`, `
    <table class="al-table">
      <tr><th>Hit dice / magic level</th><td>${AL.hpText(L)} (d4) / ${AL.magicLevel(L)}</td><td class="hint">Spells are cast at the magic level (the number of dice), at most 7.</td></tr>
      <tr><th>Intelligence ${int}</th><td>Spells to ${maxSpell ? AL.ord(maxSpell) : "—"}; potions to ${maxPotion ? `${AL.ord(maxPotion)} difficulty` : "—"}</td><td class="hint">12 for 3rd level spells and second difficulty potions, 14 for 4th and third, 16 for 5th and fourth.</td></tr>
      <tr><th>Combat and saves</th><td>As magic-user; −2 except vs. spells</td><td class="hint">Dagger (never thrown) and dart only. No magic armor, not even bracers of defense; cloaks and rings of protection allowed.</td></tr>
      <tr><th>Familiar</th><td><select name="al-familiar"><option value="" ${fam ? "" : "selected"}>None</option><option value="yes" ${fam === "yes" ? "selected" : ""}>Has a familiar (+5%)</option><option value="lost" ${fam === "lost" ? "selected" : ""}>Familiar killed (−5%)</option></select></td><td class="hint">Applied to every chance below.</td></tr>
    </table>`));
  const rows = AL.ABILITY_KEYS.map(k => {
    const v = pct(actor, AL.ability(L, k));
    const gate = k.startsWith("p") && k.length === 2 && +k[1] > maxPotion ? " (intelligence too low)" : "";
    return `<tr><th>${AL.ABILITY_LABELS[k]}</th><td>${v === null ? "—" : `<strong>${v}%</strong>`}</td><td>${v === null || gate ? `<span class="hint">${gate}</span>` : `<button type="button" data-al-roll="${k}"><i class="fa-solid fa-dice-d20"></i> Roll</button>`}</td></tr>`;
  });
  out.push(box("Abilities", `<table class="al-table">${rows.join("")}</table>
    <p class="hint">Analysis (8th level): 10% of the potion is used up; an explosion is checked first (${AL.analysisExplosion(L)}% at this level, 4d4). Without the prescription in the alchemist's book, the chance of naming the potion wrongly is 40%; with it, 15%. Charge 150 GP. The “10% test”: 40 GP, plus 10 GP a level.</p>
    ${L >= 9 ? `<p><button type="button" data-al-roll="mixture"><i class="fa-solid fa-flask"></i> Mixture analysis</button> <span class="hint">${AL.MIXTURE[L][0]}% accurate, ${AL.MIXTURE[L][1]}% explosion (4d6); 450 GP. Results from the DMG p.119 chart.</span></p>` : ""}`));
  if (L >= 7) out.push(box("Poisons", `<p><select name="al-poison">${AL.POISONS.map(p => `<option value="${p[0]}">${p[1]}: ${p[2]} (save: ${p[3]}, ${p[4] >= 0 ? "+" : ""}${p[4]})</option>`).join("")}</select>
    <button type="button" data-al-poison><i class="fa-solid fa-skull-crossbones"></i> Make</button></p>
    <p class="hint">Roll d100, less 16 a level above 7th (${AL.poisonMod(L)}). Half efficacy: an ingested poison does its successful-save damage on a failed save and none on a successful one; insinuative ones 2d4, 2d6, 2d10, 2d12. Costs: DMG p.20.</p>`));
  const later = [["A", 1, "Potter: makes pottery for heating, stirring, grinding and storing; each pot takes at least 48 hours. Sells for 1-100 SP."],
    ["B", 2, "Glassblower: beakers, flasks and other glass, 3-8 hours a piece; sells for 6-600 SP. From 8th level, pottery and glass always succeed."],
    ["C", 3, "Apprentice: taught read magic; learns other spells as a magic-user does. The “10% test”: a sip identifies a potion already tested before; keep a list."],
    ["D", 4, "Brewer: first difficulty potions only, and must be told what to mix or 85% likely to fail (failure gives the opposite effect, which does not show at first). 75% know how to brew beer, ale or malt liquors."],
    ["E", 5, "Alember: works on potions under supervision; learns Alchemese."],
    ["F", 6, "Identifier: second level spells; identify potion is taught first (intelligence counts 2 higher to learn it)."],
    ["G", 7, "Scholar: third level spells, and poisons."],
    ["H", 8, "Graduate: analysis of potions without drinking them."],
    ["I", 9, "Alchemist: predicts the result of mixing two potions."]];
  out.push(box("Special notes", `<ul class="al-list">${later.map(([n, lv, t]) => `<li class="${L >= lv ? "" : "al-later"}"><strong>${n}.</strong> ${t}</li>`).join("")}
    <li>Key ingredient substituted: −10% (first difficulty), −16% (second), −23% (third), −40% (fourth).</li></ul>`));
  out.push(box("Rules to remember", `<ul class="al-list">
    <li>Always a non-player character, met in a town or hired as a henchman. Experience only from the trade, never from adventuring (awards in the compendium).</li>
    <li>Strength 9, intelligence 10, wisdom 6, dexterity 9, constitution 14 or more; charisma under 16. Human, elf or half-elf; only humans become masters and grandmasters. Never multi-classed. Lawful by 6th level (80% lawful neutral, 10% lawful evil, 10% lawful good).</li>
    <li>Spells and prescriptions are in Alchemese. Copying a spell without <em>write</em>: 10% error per spell level and a week per level; an error ruins it 80%, backfires 20%. Cannot read cleric or illusionist scrolls or books; scrolls are useless even with read magic.</li>
    <li>Magic items: wands of detection and magic missile only, no rods or staves; daggers and darts; and from the DMG miscellaneous list: alchemy jug (a Master gets two liquids a day), bag of transmuting, bag of holding, beaker of plentiful potions, brooch of shielding, crystal ball, decanter of endless water, dusts of appearance, disappearance and sneezing and choking, flask of curses, helm of comprehending languages and reading magic, helm of telepathy, Keoghtom's ointment, manual of bodily health, mirror of mental prowess, Nolzur's marvelous pigments, periapts of health and proof against poison, scarab of protection, stones of good luck and weight, iron flask.</li>
    <li>Alchemists, Masters and Grandmasters hire 3-10 helpers; with a town shop, prices run 40-100% over list.</li>
  </ul>`));
  return out.join("");
}

async function card(actor, title, sub, roll, lines) {
  return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), rolls: roll ? [].concat(roll) : [],
    content: `<div class="frpg1e-card"><header class="card-head"><div><div class="card-title">${esc(actor.name)}: ${esc(title)}</div><div class="card-sub">${esc(sub)}</div></div></header>${lines.map(l => `<p>${l}</p>`).join("")}</div>` });
}

/** Roll an ability from the chart. Potions on a failure read the result table (p.58). */
export async function rollAbility(actor, key) {
  const c = (actor.system.classInfo ?? []).find(x => x.key === AL.KEY);
  if (!c) return null;
  const L = Math.min(AL.MAX_LEVEL, c.level);
  if (key === "mixture") {
    const [acc, boom] = AL.MIXTURE[L] ?? [];
    if (!acc) return null;
    const e = await new Roll("1d100").evaluate(), a = await new Roll("1d100").evaluate();
    const exploded = e.total <= boom;
    const lines = [exploded ? `<strong>Explosion</strong> (${e.total} ≤ ${boom}%): roll 4d6 damage.` : `No explosion (${e.total}).`,
      `Accuracy roll ${a.total} vs ${pct(actor, acc)}%: ${a.total <= pct(actor, acc) ? "tell the true result (DMG p.119)." : "re-roll on the DMG p.119 chart and tell that result."}`,
      "About 5% of each potion is mixed, so the result does occur, much reduced; such an explosion does 1d8."];
    return card(actor, "Mixture analysis", `Alchemist ${L}`, [e, a], lines);
  }
  const chance = pct(actor, AL.ability(L, key));
  if (chance === null) return null;
  const rolls = [];
  const lines = [];
  if (key === "known" || key === "unknown") {
    const e = await new Roll("1d100").evaluate(); rolls.push(e);
    const ex = AL.analysisExplosion(L);
    if (e.total <= ex) { lines.push(`<strong>Explosion</strong> (${e.total} ≤ ${ex}%): 4d4 damage. The analysis fails.`); return card(actor, AL.ABILITY_LABELS[key], `${chance}%`, rolls, lines); }
    lines.push(`No explosion (${e.total} > ${ex}%).`);
  }
  const r = await new Roll("1d100").evaluate(); rolls.push(r);
  const ok = r.total <= chance;
  lines.push(`<strong>${r.total}</strong> vs ${chance}%: <strong>${ok ? "Success" : "Failure"}</strong>.`);
  if (/^p\d$/.test(key) && !ok) {
    const mod = AL.potionMod(L);
    const n = Math.max(1, r.total - mod);
    let res = AL.potionResult(n);
    if (res[2] === "Success") res = AL.POTION_RESULT[1];
    lines.push(`Result table (${r.total} − ${mod} = ${n}): <strong>${res[2]}</strong>${res[3] ? `, ${res[3]} damage` : ""}. Adverse results are not evident at first.`);
  }
  return card(actor, AL.ABILITY_LABELS[key], `Alchemist ${L}${familiarMod(actor) ? ` (familiar ${familiarMod(actor) > 0 ? "+" : ""}${familiarMod(actor)}%)` : ""}`, rolls, lines);
}

export async function rollPoison(actor, key) {
  const c = (actor.system.classInfo ?? []).find(x => x.key === AL.KEY);
  const p = AL.POISONS.find(x => x[0] === key);
  if (!c || !p || c.level < 7) return null;
  const r = await new Roll("1d100").evaluate();
  const mod = AL.poisonMod(Math.min(AL.MAX_LEVEL, c.level)) + familiarMod(actor);
  const n = Math.max(1, r.total - mod);
  const res = AL.poisonResult(key, n);
  const half = res === "Half efficacy" ? (key.startsWith("i") ? ` Does ${p[3]} on a failed save, nothing on a save.` : ` Does ${AL.HALF_INSINUATIVE[key]} on a failed save, nothing on a save.`) : "";
  return card(actor, `Poison: ${p[1]}`, `Success 1-${p[5]}, failure to ${p[6]}, then half efficacy`, r, [`${r.total} − ${mod} = <strong>${n}</strong>: <strong>${res}</strong>.${half}`]);
}
