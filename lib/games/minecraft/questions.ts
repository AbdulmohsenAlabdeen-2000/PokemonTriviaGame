/**
 * Minecraft trivia generators.
 *
 * Live data is fetched from the PrismarineJS minecraft-data repo on GitHub
 * (https://github.com/PrismarineJS/minecraft-data). Pure JSON, no API key.
 *
 * Image sources are minecraft.wiki's Special:FilePath endpoint, which serves
 * hot-link-friendly PNG/JPEG sprites for any Minecraft entity, item, or block
 * by its display name (with spaces converted to underscores).
 *
 * Six categories:
 *   1. Blocks    — "Name this block" (sprite of a block, options are names)
 *   2. Mobs      — "Hostile or passive?" (sprite of a mob)
 *   3. Biomes    — "Which dimension is this biome in?" (overworld/nether/end)
 *   4. Items     — "What's the max stack size of this item?"
 *   5. Tools     — "Which tier is this tool?" (wood/stone/iron/diamond/netherite)
 *   6. Crafting  — "What's needed to craft an X?" (curated, harder)
 */

import type { Question, Difficulty } from "../types";
import { POINTS_FOR } from "../types";

const PMD_BASE = "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/pc/1.21.4";
const WIKI_FILE = (filename: string) =>
  `https://minecraft.wiki/Special:FilePath/${filename}`;

// ----- minecraft-data shapes (only fields we read) -----------------------
type MCItem = { id: number; name: string; displayName: string; stackSize: number };
type MCEntity = {
  id: number;
  name: string;
  displayName: string;
  category?: string;          // "Hostile mobs", "Passive mobs", "Vehicles"...
  type?: string;              // "mob", "animal", ...
};
type MCBiome = {
  id: number;
  name: string;
  displayName: string;
  category: string;           // "plains", "nether", "the_end", ...
  dimension: string;          // "overworld", "nether", "end"
  has_precipitation: boolean;
  temperature: number;
};

// ----- Network cache -----------------------------------------------------
const cache = new Map<string, unknown>();
async function fetchJson<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`minecraft-data ${r.status} ${url}`);
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

function wikiName(displayName: string) {
  return displayName.replace(/ /g, "_") + ".png";
}

// ==========================================================================
//  CURATED POOLS
// ==========================================================================
// These are explicit display names chosen so the wiki's Special:FilePath
// works reliably on each one — verified by hand. The minecraft-data JSON
// includes hundreds of items, but image lookup is best-effort, so we keep
// the visible pool tight for predictability.

/** Each block carries its iconic colour so we can ask "what colour is X?" */
type BlockEntry = { slug: string; colour: string };
const BLOCK_POOL_EASY: BlockEntry[] = [
  { slug: "Cobblestone",     colour: "Gray" },
  { slug: "Oak_Planks",      colour: "Brown" },
  { slug: "Stone",           colour: "Gray" },
  { slug: "Sand",            colour: "Yellow" },
  { slug: "Dirt",            colour: "Brown" },
  { slug: "Furnace",         colour: "Gray" },
  { slug: "Crafting_Table",  colour: "Brown" },
  { slug: "Bookshelf",       colour: "Brown" },
  { slug: "Glass",           colour: "White" },
  { slug: "Chest",           colour: "Brown" }
];
const BLOCK_POOL_MEDIUM: BlockEntry[] = [
  { slug: "Diamond_Ore",     colour: "Cyan" },
  { slug: "Redstone_Ore",    colour: "Red" },
  { slug: "Obsidian",        colour: "Black" },
  { slug: "Glowstone",       colour: "Yellow" },
  { slug: "Sea_Lantern",     colour: "White" },
  { slug: "End_Stone",       colour: "Yellow" },
  { slug: "Nether_Bricks",   colour: "Red" },
  { slug: "Quartz_Block",    colour: "White" },
  { slug: "Honeycomb_Block", colour: "Orange" }
];
const BLOCK_POOL_HARD: BlockEntry[] = [
  { slug: "Beacon",                colour: "Cyan" },
  { slug: "Conduit",               colour: "Cyan" },
  { slug: "Reinforced_Deepslate",  colour: "Black" },
  { slug: "Sculk_Catalyst",        colour: "Black" },
  { slug: "Sculk_Sensor",          colour: "Cyan" },
  { slug: "Echo_Shard",            colour: "Cyan" },
  { slug: "Allium",                colour: "Purple" },
  { slug: "Lily_of_the_Valley",    colour: "White" }
];

const ALL_BLOCK_COLOURS = [
  "Red", "Blue", "Yellow", "Green", "Orange", "Purple",
  "Black", "White", "Brown", "Gray", "Cyan"
];

const MOB_POOL_EASY: { name: string; hostile: boolean }[] = [
  { name: "Cow",     hostile: false },
  { name: "Pig",     hostile: false },
  { name: "Sheep",   hostile: false },
  { name: "Chicken", hostile: false },
  { name: "Zombie",  hostile: true },
  { name: "Skeleton",hostile: true },
  { name: "Creeper", hostile: true },
  { name: "Spider",  hostile: true }
];
const MOB_POOL_MEDIUM: { name: string; hostile: boolean }[] = [
  { name: "Enderman",  hostile: true },
  { name: "Wolf",      hostile: false },
  { name: "Witch",     hostile: true },
  { name: "Slime",     hostile: true },
  { name: "Bee",       hostile: false },
  { name: "Axolotl",   hostile: false },
  { name: "Pillager",  hostile: true },
  { name: "Drowned",   hostile: true }
];
const MOB_POOL_HARD: { name: string; hostile: boolean }[] = [
  { name: "Allay",     hostile: false },
  { name: "Warden",    hostile: true },
  { name: "Ghast",     hostile: true },
  { name: "Shulker",   hostile: true },
  { name: "Phantom",   hostile: true },
  { name: "Vindicator",hostile: true },
  { name: "Frog",      hostile: false },
  { name: "Camel",     hostile: false }
];

const ITEM_POOL_EASY: { name: string; stack: 64 | 16 | 1 }[] = [
  { name: "Apple",       stack: 64 },
  { name: "Bread",       stack: 64 },
  { name: "Cobblestone", stack: 64 },
  { name: "Egg",         stack: 16 },
  { name: "Ender_Pearl", stack: 16 }
];
const ITEM_POOL_MEDIUM: { name: string; stack: 64 | 16 | 1 }[] = [
  { name: "Snowball",     stack: 16 },
  { name: "Bucket",       stack: 16 },
  { name: "Honey_Bottle", stack: 16 },
  { name: "Sign",         stack: 16 },
  { name: "Saddle",       stack: 1 }
];
const ITEM_POOL_HARD: { name: string; stack: 64 | 16 | 1 }[] = [
  { name: "Trident",       stack: 1 },
  { name: "Elytra",        stack: 1 },
  { name: "Cake",          stack: 1 },
  { name: "Totem_of_Undying", stack: 1 },
  { name: "Music_Disc_13", stack: 1 }
];

type ToolTier = "Wood" | "Stone" | "Iron" | "Gold" | "Diamond" | "Netherite";
type ToolEntry = { name: string; tier: ToolTier; colour: string };

/** Tool material colour — matches the in-game blade/head appearance. */
const TOOL_TIER_COLOUR: Record<ToolTier, string> = {
  Wood:      "Brown",
  Stone:     "Gray",
  Iron:      "Light Gray",
  Gold:      "Yellow",
  Diamond:   "Cyan",
  Netherite: "Black"
};

const TOOL_POOL_EASY: ToolEntry[] = [
  { name: "Wooden_Sword",  tier: "Wood",  colour: TOOL_TIER_COLOUR.Wood },
  { name: "Stone_Pickaxe", tier: "Stone", colour: TOOL_TIER_COLOUR.Stone },
  { name: "Iron_Axe",      tier: "Iron",  colour: TOOL_TIER_COLOUR.Iron }
];
const TOOL_POOL_MEDIUM: ToolEntry[] = [
  { name: "Iron_Sword",      tier: "Iron",    colour: TOOL_TIER_COLOUR.Iron },
  { name: "Diamond_Pickaxe", tier: "Diamond", colour: TOOL_TIER_COLOUR.Diamond },
  { name: "Stone_Shovel",    tier: "Stone",   colour: TOOL_TIER_COLOUR.Stone },
  { name: "Gold_Hoe",        tier: "Gold",    colour: TOOL_TIER_COLOUR.Gold }
];
const TOOL_POOL_HARD: ToolEntry[] = [
  { name: "Netherite_Sword",   tier: "Netherite", colour: TOOL_TIER_COLOUR.Netherite },
  { name: "Netherite_Pickaxe", tier: "Netherite", colour: TOOL_TIER_COLOUR.Netherite },
  { name: "Diamond_Axe",       tier: "Diamond",   colour: TOOL_TIER_COLOUR.Diamond },
  { name: "Gold_Sword",        tier: "Gold",      colour: TOOL_TIER_COLOUR.Gold }
];

const ALL_TIERS: ToolTier[] = ["Wood", "Stone", "Iron", "Gold", "Diamond", "Netherite"];
const ALL_TOOL_COLOURS = ["Brown", "Gray", "Light Gray", "Yellow", "Cyan", "Black"];

// ==========================================================================
//  GENERATORS
// ==========================================================================

/**
 * "Which block is this?" — show the block in full colour so players can
 * actually identify it. Naming a block from a black silhouette is the
 * wrong puzzle because Minecraft blocks are mostly cubic shapes.
 */
async function genBlockName(
  block: BlockEntry,
  difficulty: Difficulty,
  allBlocks: BlockEntry[]
): Promise<Question> {
  const correct = block.slug.replace(/_/g, " ");
  const wrongs = pickN(allBlocks.filter((b) => b.slug !== block.slug), 3)
    .map((b) => b.slug.replace(/_/g, " "));
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `mc-blockname-${block.slug}`,
    categoryId: "blocks",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which block is this?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(block.slug + ".png"),
    preventSilhouette: true
  };
}

/**
 * "What colour is the X block?" — silhouette the image so the colour
 * is hidden, and put the block name in the prompt. Player has to recall
 * the colour from memory.
 */
async function genBlockColour(
  block: BlockEntry,
  difficulty: Difficulty
): Promise<Question> {
  const niceName = block.slug.replace(/_/g, " ");
  const wrongs = pickN(ALL_BLOCK_COLOURS, 3, new Set([block.colour]));
  const opts = shuffle([block.colour, ...wrongs]) as [string, string, string, string];
  return {
    id: `mc-blockcolour-${block.slug}`,
    categoryId: "blocks",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What is the dominant colour of the ${niceName} block?`,
    options: opts,
    answerIndex: opts.indexOf(block.colour) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(block.slug + ".png"),
    forceSilhouette: true
  };
}

/** "Is the X mob hostile or passive?" — prompt names the mob, image shown. */
async function genMobBehaviour(
  mob: { name: string; hostile: boolean },
  difficulty: Difficulty
): Promise<Question> {
  const correct = mob.hostile ? "Hostile" : "Passive";
  const opts = shuffle([
    "Hostile", "Passive", "Boss", "Vehicle"
  ]) as [string, string, string, string];
  return {
    id: `mc-mobbehaviour-${mob.name}`,
    categoryId: "mobs",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `Is the ${mob.name.replace(/_/g, " ")} hostile or passive?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(mob.name + ".png"),
    preventSilhouette: true
  };
}

/**
 * "Which mob is this?" — show the mob in full colour, options are mob
 * names. Adds variety to the Mobs category beyond hostile/passive and
 * is genuinely harder for the obscure mobs (Allay, Frog, Bogged…).
 */
async function genMobName(
  mob: { name: string; hostile: boolean },
  difficulty: Difficulty,
  allMobs: { name: string; hostile: boolean }[]
): Promise<Question> {
  const correct = mob.name.replace(/_/g, " ");
  const wrongs = pickN(
    allMobs.filter((m) => m.name !== mob.name).map((m) => m.name.replace(/_/g, " ")),
    3
  );
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `mc-mobname-${mob.name}`,
    categoryId: "mobs",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which Minecraft mob is this?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(mob.name + ".png"),
    preventSilhouette: true
  };
}

async function genBiome(
  biome: MCBiome,
  difficulty: Difficulty,
  allDimensions: string[]
): Promise<Question> {
  const dimensionNames: Record<string, string> = {
    overworld: "Overworld",
    nether: "Nether",
    end: "The End"
  };
  const correct = dimensionNames[biome.dimension] || "Overworld";
  const wrongs = pickN(allDimensions.filter((d) => d !== correct), 3);
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  // Real biome screenshot from minecraft.wiki — every biome's displayName
  // (with spaces → underscores) resolves to a PNG via Special:FilePath.
  const biomeImage = WIKI_FILE(biome.displayName.replace(/ /g, "_") + ".png");
  return {
    id: `mc-biome-${biome.name}`,
    categoryId: "biomes",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `Which dimension is the ${biome.displayName} biome in?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: biomeImage,
    preventSilhouette: true
  };
}

async function genItem(
  item: { name: string; stack: 64 | 16 | 1 },
  difficulty: Difficulty
): Promise<Question> {
  const correct = String(item.stack);
  const opts = shuffle(["64", "16", "1", "32"]) as [string, string, string, string];
  return {
    id: `mc-item-${item.name}`,
    categoryId: "items",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What is the maximum stack size of ${item.name.replace(/_/g, " ")}?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(item.name + ".png"),
    preventSilhouette: true
  };
}

/**
 * "Which tier is this tool?" — MUST show full colour, because the tier
 * is identified by the material colour (wood = brown, iron = silver,
 * diamond = cyan, etc.). Silhouetting hides the very thing you need
 * to answer.
 */
async function genToolTier(
  tool: ToolEntry,
  difficulty: Difficulty
): Promise<Question> {
  const correct = tool.tier;
  const wrongs = pickN(ALL_TIERS.filter((t) => t !== correct), 3);
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `mc-tooltier-${tool.name}`,
    categoryId: "tools",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which tier is this tool?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(tool.name + ".png"),
    preventSilhouette: true
  };
}

/**
 * "What colour is the X tool?" — silhouette so the colour is hidden,
 * prompt names the tool. Forces players to recall the material colour
 * from memory.
 */
async function genToolColour(
  tool: ToolEntry,
  difficulty: Difficulty
): Promise<Question> {
  const niceName = tool.name.replace(/_/g, " ");
  const wrongs = pickN(ALL_TOOL_COLOURS, 3, new Set([tool.colour]));
  const opts = shuffle([tool.colour, ...wrongs]) as [string, string, string, string];
  return {
    id: `mc-toolcolour-${tool.name}`,
    categoryId: "tools",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What colour is the ${niceName}?`,
    options: opts,
    answerIndex: opts.indexOf(tool.colour) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(tool.name + ".png"),
    forceSilhouette: true
  };
}

// Small curated list of crafting trivia — the questions are facts so they
// don't need an API call, but each shows a relevant block sprite.
const CRAFTING_QS: { difficulty: Difficulty; prompt: string; correct: string; wrongs: string[]; image: string }[] = [
  {
    difficulty: "easy",
    prompt: "How many planks does one log give you?",
    correct: "4", wrongs: ["1", "2", "8"],
    image: WIKI_FILE("Oak_Planks.png")
  },
  {
    difficulty: "easy",
    prompt: "How many planks are needed to craft a Crafting Table?",
    correct: "4", wrongs: ["8", "1", "9"],
    image: WIKI_FILE("Crafting_Table.png")
  },
  {
    difficulty: "medium",
    prompt: "How many sticks are needed to craft a Bow?",
    correct: "3", wrongs: ["1", "2", "4"],
    image: WIKI_FILE("Bow.png")
  },
  {
    difficulty: "medium",
    prompt: "What does a Furnace require to craft (besides the cross arrangement)?",
    correct: "Cobblestone", wrongs: ["Stone", "Iron", "Wood"],
    image: WIKI_FILE("Furnace.png")
  },
  {
    difficulty: "hard",
    prompt: "How many Diamonds does a full set of Diamond Armour need?",
    correct: "24", wrongs: ["16", "20", "32"],
    image: WIKI_FILE("Diamond.png")
  },
  {
    difficulty: "hard",
    prompt: "What is the only way to obtain the Heart of the Sea?",
    correct: "Buried treasure chest", wrongs: ["End city loot", "Fishing", "Stronghold loot"],
    image: WIKI_FILE("Heart_of_the_Sea.png")
  }
];

async function genCrafting(
  q: typeof CRAFTING_QS[number]
): Promise<Question> {
  const opts = shuffle([q.correct, ...q.wrongs]) as [string, string, string, string];
  return {
    id: `mc-crafting-${q.prompt.slice(0, 20)}`,
    categoryId: "crafting",
    difficulty: q.difficulty,
    value: POINTS_FOR[q.difficulty],
    prompt: q.prompt,
    options: opts,
    answerIndex: opts.indexOf(q.correct) as 0 | 1 | 2 | 3,
    image: q.image,
    preventSilhouette: true
  };
}

// ==========================================================================
//  ENTRY POINT
// ==========================================================================

export async function buildMinecraftQuestions(): Promise<Question[]> {
  // Live data fetches: only used for the Biomes category (we read dimension)
  const biomes = await fetchJson<MCBiome[]>(`${PMD_BASE}/biomes.json`).catch(() => []);
  const overworldBiomes = biomes.filter((b) => b.dimension === "overworld");
  const netherBiomes    = biomes.filter((b) => b.dimension === "nether");
  const endBiomes       = biomes.filter((b) => b.dimension === "end");

  const dimensions = ["Overworld", "Nether", "The End"];

  async function pair<T>(
    pool: T[],
    difficulty: Difficulty,
    gen: (item: T, d: Difficulty) => Promise<Question | null>,
    needed = 2
  ): Promise<Question[]> {
    const out: Question[] = [];
    for (let i = 0; i < pool.length && out.length < needed; i++) {
      try {
        const q = await gen(pool[i], difficulty);
        if (q) out.push(q);
      } catch { /* skip */ }
    }
    return out;
  }

  const allBlocks = [...BLOCK_POOL_EASY, ...BLOCK_POOL_MEDIUM, ...BLOCK_POOL_HARD];
  const allMobs = [...MOB_POOL_EASY, ...MOB_POOL_MEDIUM, ...MOB_POOL_HARD];

  // Biome easy = mix of overworld biomes; medium = nether biomes; hard = end + obscure
  const biomeEasy = shuffle(overworldBiomes).slice(0, 6);
  const biomeMedium = shuffle(netherBiomes).slice(0, 4)
    .concat(shuffle(overworldBiomes).slice(0, 2));
  const biomeHard = shuffle(endBiomes).slice(0, 4)
    .concat(shuffle(overworldBiomes).filter((b) => b.category === "extreme_hills" || b.category === "icy" || b.category === "mushroom").slice(0, 2));

  /**
   * Coin-flip between two question shapes per slot. Each call shuffles
   * the pool so the same items don't appear in the same order on every
   * play, and randomly picks one of two generators per slot.
   */
  async function blockMix(pool: BlockEntry[], difficulty: Difficulty): Promise<Question[]> {
    const out: Question[] = [];
    for (const b of shuffle(pool)) {
      if (out.length >= 2) break;
      try {
        const askColour = Math.random() < 0.5;
        out.push(askColour
          ? await genBlockColour(b, difficulty)
          : await genBlockName(b, difficulty, allBlocks));
      } catch { /* skip and try next */ }
    }
    return out;
  }
  async function mobMix(pool: typeof MOB_POOL_EASY, difficulty: Difficulty): Promise<Question[]> {
    const out: Question[] = [];
    for (const m of shuffle(pool)) {
      if (out.length >= 2) break;
      try {
        const askName = Math.random() < 0.5;
        out.push(askName
          ? await genMobName(m, difficulty, allMobs)
          : await genMobBehaviour(m, difficulty));
      } catch { /* skip */ }
    }
    return out;
  }
  async function toolMix(pool: ToolEntry[], difficulty: Difficulty): Promise<Question[]> {
    const out: Question[] = [];
    for (const t of shuffle(pool)) {
      if (out.length >= 2) break;
      try {
        const askColour = Math.random() < 0.5;
        out.push(askColour
          ? await genToolColour(t, difficulty)
          : await genToolTier(t, difficulty));
      } catch { /* skip */ }
    }
    return out;
  }

  const [
    blocksE, blocksM, blocksH,
    mobsE,   mobsM,   mobsH,
    biomesE, biomesM, biomesH,
    itemsE,  itemsM,  itemsH,
    toolsE,  toolsM,  toolsH,
    craftingE, craftingM, craftingH
  ] = await Promise.all([
    blockMix(BLOCK_POOL_EASY,   "easy"),
    blockMix(BLOCK_POOL_MEDIUM, "medium"),
    blockMix(BLOCK_POOL_HARD,   "hard"),

    mobMix(MOB_POOL_EASY,   "easy"),
    mobMix(MOB_POOL_MEDIUM, "medium"),
    mobMix(MOB_POOL_HARD,   "hard"),

    pair(biomeEasy,   "easy",   (b, d) => genBiome(b, d, dimensions)),
    pair(biomeMedium, "medium", (b, d) => genBiome(b, d, dimensions)),
    pair(biomeHard,   "hard",   (b, d) => genBiome(b, d, dimensions)),

    pair(shuffle(ITEM_POOL_EASY),   "easy",   genItem),
    pair(shuffle(ITEM_POOL_MEDIUM), "medium", genItem),
    pair(shuffle(ITEM_POOL_HARD),   "hard",   genItem),

    toolMix(TOOL_POOL_EASY,   "easy"),
    toolMix(TOOL_POOL_MEDIUM, "medium"),
    toolMix(TOOL_POOL_HARD,   "hard"),

    pair(shuffle(CRAFTING_QS.filter((q) => q.difficulty === "easy")),   "easy",   (q) => genCrafting(q)),
    pair(shuffle(CRAFTING_QS.filter((q) => q.difficulty === "medium")), "medium", (q) => genCrafting(q)),
    pair(shuffle(CRAFTING_QS.filter((q) => q.difficulty === "hard")),   "hard",   (q) => genCrafting(q))
  ]);

  return [
    ...blocksE,    ...blocksM,    ...blocksH,
    ...mobsE,      ...mobsM,      ...mobsH,
    ...biomesE,    ...biomesM,    ...biomesH,
    ...itemsE,     ...itemsM,     ...itemsH,
    ...toolsE,     ...toolsM,     ...toolsH,
    ...craftingE,  ...craftingM,  ...craftingH
  ];
}

// Suppress unused warning for the entity type — kept for future generators
export type _MCEntity = MCEntity;
export type _MCItem = MCItem;
export type _wikiName = typeof wikiName;
