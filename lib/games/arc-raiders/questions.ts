/**
 * ARC Raiders trivia generators.
 *
 * Live data from MetaForge (https://metaforge.app), a community-built API for
 * the game ARC Raiders. Endpoints used:
 *   - /api/arc-raiders/items     50 surface items + their icons + rarity + value
 *   - /api/arc-raiders/arcs      22 ARC enemies + their icons
 *   - /api/arc-raiders/traders   5 traders + which items they sell
 *
 * Six categories:
 *   1. Items     — "Which item is this?"          (icon + name distractors)
 *   2. Rarity    — "What rarity is this item?"    (Common/Uncommon/Rare/Epic/Legendary)
 *   3. Type      — "What item type is this?"      (Material / Quick Use / Trinket / etc.)
 *   4. ARCs      — "Which ARC enemy is this?"     (enemy icon + name distractors)
 *   5. Traders   — "Which trader sells this item?" (Apollo / Celeste / Lance / Shani / TianWen)
 *   6. Value     — "Roughly what is this item worth?" (price brackets)
 */

import type { Question, Difficulty } from "../types";
import { POINTS_FOR } from "../types";

// Proxied through our Next.js route handler (see app/api/arc-raiders/[...path])
// because MetaForge doesn't send CORS headers — direct browser fetch fails.
const META = "/api/arc-raiders";

// ----- API shapes (only fields we read) ----------------------------------
type AItem = {
  id: string;
  name: string;
  description: string;
  item_type: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  value: number;
  icon: string;
};
type AArc = {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
};
type ATraders = Record<string, AItem[]>;
type AQuest = {
  id: string;
  name: string;
  trader_name: string;
  image: string | null;
};

// ----- Network cache -----------------------------------------------------
const cache = new Map<string, unknown>();
async function fetchJson<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`MetaForge ${r.status} ${url}`);
  const data = (await r.json()) as T;
  cache.set(url, data);
  return data;
}

// ----- Helpers -----------------------------------------------------------
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function pickN<T>(arr: T[], n: number, exclude: Set<T> = new Set()): T[] {
  return shuffle(arr.filter((x) => !exclude.has(x))).slice(0, n);
}

const ALL_RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
const TRADER_NAMES = ["Apollo", "Celeste", "Lance", "Shani", "TianWen"] as const;

// Bucket item value into a coarse price bracket so the Value question is
// answerable from feel rather than memorised numbers.
const VALUE_BRACKETS = [
  { label: "Less than 500",  min: 0,    max: 500 },
  { label: "500 – 2,000",    min: 500,  max: 2000 },
  { label: "2,000 – 5,000",  min: 2000, max: 5000 },
  { label: "More than 5,000", min: 5000, max: Infinity }
];
function bracketFor(value: number) {
  return VALUE_BRACKETS.find((b) => value >= b.min && value < b.max)?.label || "Less than 500";
}

// Difficulty buckets for items: by rarity (cheaper, common items = easy)
function difficultyForItem(rarity: AItem["rarity"]): Difficulty {
  if (rarity === "Common" || rarity === "Uncommon") return "easy";
  if (rarity === "Rare") return "medium";
  return "hard"; // Epic / Legendary
}

// ==========================================================================
//  GENERATORS
// ==========================================================================

function genItemName(item: AItem, difficulty: Difficulty, allItems: AItem[]): Question {
  const wrongs = pickN(allItems.filter((i) => i.id !== item.id), 3).map((i) => i.name);
  const opts = shuffle([item.name, ...wrongs]) as [string, string, string, string];
  return {
    id: `ar-item-${item.id}`,
    categoryId: "items",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which ARC Raiders item is this?",
    options: opts,
    answerIndex: opts.indexOf(item.name) as 0 | 1 | 2 | 3,
    image: item.icon,
    preventSilhouette: true
  };
}

function genRarity(item: AItem, difficulty: Difficulty): Question {
  const wrongs = pickN([...ALL_RARITIES], 3, new Set([item.rarity]));
  const opts = shuffle([item.rarity, ...wrongs]) as [string, string, string, string];
  return {
    id: `ar-rarity-${item.id}`,
    categoryId: "rarity",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What rarity is the ${item.name}?`,
    options: opts,
    answerIndex: opts.indexOf(item.rarity) as 0 | 1 | 2 | 3,
    image: item.icon,
    preventSilhouette: true
  };
}

function genItemType(item: AItem, difficulty: Difficulty, allTypes: string[]): Question {
  const wrongs = pickN(allTypes.filter((t) => t !== item.item_type), 3);
  const opts = shuffle([item.item_type, ...wrongs]) as [string, string, string, string];
  return {
    id: `ar-type-${item.id}`,
    categoryId: "type",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What category does the ${item.name} belong to?`,
    options: opts,
    answerIndex: opts.indexOf(item.item_type) as 0 | 1 | 2 | 3,
    image: item.icon,
    preventSilhouette: true
  };
}

function genArc(arc: AArc, difficulty: Difficulty, allArcs: AArc[]): Question {
  const wrongs = pickN(allArcs.filter((a) => a.id !== arc.id), 3).map((a) => a.name);
  const opts = shuffle([arc.name, ...wrongs]) as [string, string, string, string];
  return {
    id: `ar-arc-${arc.id}`,
    categoryId: "arcs",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which ARC enemy is this?",
    options: opts,
    answerIndex: opts.indexOf(arc.name) as 0 | 1 | 2 | 3,
    image: arc.icon,
    // Show the real ARC art — silhouette would hide the very thing the
    // player needs to identify the enemy by.
    preventSilhouette: true
  };
}

function genTrader(
  trader: string,
  item: AItem,
  difficulty: Difficulty
): Question {
  const wrongs = pickN([...TRADER_NAMES], 3, new Set([trader as typeof TRADER_NAMES[number]]));
  const opts = shuffle([trader, ...wrongs]) as [string, string, string, string];
  return {
    id: `ar-trader-${item.id}`,
    categoryId: "traders",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `Which trader sells the ${item.name}?`,
    options: opts,
    answerIndex: opts.indexOf(trader) as 0 | 1 | 2 | 3,
    image: item.icon,
    preventSilhouette: true
  };
}

/**
 * "Which trader assigns the X quest?" — broadens the Traders category
 * beyond "who sells this item?" into mission-giver trivia.
 */
function genQuestGiver(quest: AQuest, difficulty: Difficulty): Question {
  const correct = quest.trader_name;
  const wrongs = pickN([...TRADER_NAMES], 3, new Set([correct as typeof TRADER_NAMES[number]]));
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `ar-questgiver-${quest.id}`,
    categoryId: "traders",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `Which trader assigns the "${quest.name}" quest?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    // Quest images are sometimes null; fall back to a known-good icon
    image: quest.image || "https://cdn.metaforge.app/arc-raiders/icons/bandage.webp",
    preventSilhouette: true
  };
}

function genValue(item: AItem, difficulty: Difficulty): Question {
  const correct = bracketFor(item.value);
  const wrongs = pickN(VALUE_BRACKETS.map((b) => b.label), 3, new Set([correct]));
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `ar-value-${item.id}`,
    categoryId: "value",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `Roughly what is the ${item.name} worth?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: item.icon,
    preventSilhouette: true
  };
}

// ==========================================================================
//  ENTRY POINT
// ==========================================================================

export async function buildArcRaidersQuestions(): Promise<Question[]> {
  // Live fetches in parallel
  const [itemsResp, arcsResp, tradersResp, questsResp] = await Promise.all([
    fetchJson<{ data: AItem[] }>(`${META}/items`),
    fetchJson<{ data: AArc[] }>(`${META}/arcs`),
    fetchJson<{ data: ATraders } | { success: boolean; data: ATraders }>(`${META}/traders`),
    fetchJson<{ data: AQuest[] }>(`${META}/quests`).catch(() => ({ data: [] }))
  ]);

  const items: AItem[] = itemsResp.data || [];
  const arcs:  AArc[]  = arcsResp.data  || [];
  const traders = (tradersResp as { data: ATraders }).data || {};
  const quests: AQuest[] = questsResp.data || [];

  // Bucket items by difficulty
  const easyItems   = items.filter((i) => difficultyForItem(i.rarity) === "easy");
  const mediumItems = items.filter((i) => difficultyForItem(i.rarity) === "medium");
  const hardItems   = items.filter((i) => difficultyForItem(i.rarity) === "hard");

  const allItemTypes = Array.from(new Set(items.map((i) => i.item_type)));

  // Build a flat (trader, item) list for the Traders category
  const traderItemPairs: { trader: string; item: AItem }[] = [];
  for (const [name, list] of Object.entries(traders)) {
    for (const it of list) traderItemPairs.push({ trader: name, item: it });
  }

  // Bucket trader pairs by item rarity (proxy for difficulty)
  const easyTraderPairs   = traderItemPairs.filter((p) => difficultyForItem(p.item.rarity) === "easy");
  const mediumTraderPairs = traderItemPairs.filter((p) => difficultyForItem(p.item.rarity) === "medium");
  const hardTraderPairs   = traderItemPairs.filter((p) => difficultyForItem(p.item.rarity) === "hard");

  // Bucket quests 1/3 each so each difficulty gets a fresh set
  const shuffledQuests = shuffle(quests);
  const qThird = Math.ceil(quests.length / 3);
  const easyQuests   = shuffledQuests.slice(0, qThird);
  const mediumQuests = shuffledQuests.slice(qThird, qThird * 2);
  const hardQuests   = shuffledQuests.slice(qThird * 2);

  /**
   * Traders category mix: coin-flips between "Which trader sells X?"
   * (existing item-based) and "Which trader assigns the X quest?"
   * (new quest-based). Each slot ships a different mix per game.
   */
  function tradersMix(
    pairs: typeof easyTraderPairs,
    qPool: AQuest[],
    difficulty: Difficulty
  ): Question[] {
    const out: Question[] = [];
    const shuffledPairs = shuffle(pairs);
    const shuffledQuests = shuffle(qPool);
    let pi = 0, qi = 0;
    while (out.length < 2 && (pi < shuffledPairs.length || qi < shuffledQuests.length)) {
      const askQuest = qi < shuffledQuests.length && (pi >= shuffledPairs.length || Math.random() < 0.5);
      try {
        if (askQuest) {
          out.push(genQuestGiver(shuffledQuests[qi++], difficulty));
        } else {
          const p = shuffledPairs[pi++];
          out.push(genTrader(p.trader, p.item, difficulty));
        }
      } catch { /* skip */ }
    }
    return out;
  }

  // ARCs are not rated by rarity in the API; just split the list 1/3 each
  const shuffledArcs = shuffle(arcs);
  const easyArcs   = shuffledArcs.slice(0, Math.ceil(arcs.length / 3));
  const mediumArcs = shuffledArcs.slice(Math.ceil(arcs.length / 3), Math.ceil(arcs.length * 2 / 3));
  const hardArcs   = shuffledArcs.slice(Math.ceil(arcs.length * 2 / 3));

  function pair<T>(
    pool: T[],
    difficulty: Difficulty,
    gen: (item: T, d: Difficulty) => Question | null,
    needed = 2
  ): Question[] {
    const out: Question[] = [];
    for (let i = 0; i < pool.length && out.length < needed; i++) {
      try {
        const q = gen(pool[i], difficulty);
        if (q) out.push(q);
      } catch { /* skip */ }
    }
    return out;
  }

  const itemsE   = pair(shuffle(easyItems),   "easy",   (i, d) => genItemName(i, d, items));
  const itemsM   = pair(shuffle(mediumItems), "medium", (i, d) => genItemName(i, d, items));
  const itemsH   = pair(shuffle(hardItems),   "hard",   (i, d) => genItemName(i, d, items));

  const rarityE  = pair(shuffle(easyItems),   "easy",   genRarity);
  const rarityM  = pair(shuffle(mediumItems), "medium", genRarity);
  const rarityH  = pair(shuffle(hardItems),   "hard",   genRarity);

  const typeE    = pair(shuffle(easyItems),   "easy",   (i, d) => genItemType(i, d, allItemTypes));
  const typeM    = pair(shuffle(mediumItems), "medium", (i, d) => genItemType(i, d, allItemTypes));
  const typeH    = pair(shuffle(hardItems),   "hard",   (i, d) => genItemType(i, d, allItemTypes));

  const arcsE    = pair(easyArcs,   "easy",   (a, d) => genArc(a, d, arcs));
  const arcsM    = pair(mediumArcs, "medium", (a, d) => genArc(a, d, arcs));
  const arcsH    = pair(hardArcs,   "hard",   (a, d) => genArc(a, d, arcs));

  const tradersE = tradersMix(easyTraderPairs,   easyQuests,   "easy");
  const tradersM = tradersMix(mediumTraderPairs, mediumQuests, "medium");
  const tradersH = tradersMix(hardTraderPairs,   hardQuests,   "hard");

  const valueE   = pair(shuffle(easyItems),   "easy",   genValue);
  const valueM   = pair(shuffle(mediumItems), "medium", genValue);
  const valueH   = pair(shuffle(hardItems),   "hard",   genValue);

  return [
    ...itemsE,   ...itemsM,   ...itemsH,
    ...rarityE,  ...rarityM,  ...rarityH,
    ...typeE,    ...typeM,    ...typeH,
    ...arcsE,    ...arcsM,    ...arcsH,
    ...tradersE, ...tradersM, ...tradersH,
    ...valueE,   ...valueM,   ...valueH
  ];
}
