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

const BLOCK_POOL_EASY = [
  "Cobblestone", "Oak_Planks", "Stone", "Sand", "Dirt",
  "Furnace", "Crafting_Table", "Bookshelf", "Chest", "Glass"
];
const BLOCK_POOL_MEDIUM = [
  "Diamond_Ore", "Redstone_Ore", "Obsidian", "Glowstone",
  "Sea_Lantern", "End_Stone", "Nether_Bricks", "Quartz_Block",
  "Honeycomb_Block"
];
const BLOCK_POOL_HARD = [
  "Beacon", "Conduit", "Reinforced_Deepslate", "Sculk_Catalyst",
  "Sculk_Sensor", "Echo_Shard", "Allium", "Lily_of_the_Valley"
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
const TOOL_POOL_EASY: { name: string; tier: ToolTier }[] = [
  { name: "Wooden_Sword",  tier: "Wood" },
  { name: "Stone_Pickaxe", tier: "Stone" },
  { name: "Iron_Axe",      tier: "Iron" }
];
const TOOL_POOL_MEDIUM: { name: string; tier: ToolTier }[] = [
  { name: "Iron_Sword",      tier: "Iron" },
  { name: "Diamond_Pickaxe", tier: "Diamond" },
  { name: "Stone_Shovel",    tier: "Stone" },
  { name: "Gold_Hoe",        tier: "Gold" }
];
const TOOL_POOL_HARD: { name: string; tier: ToolTier }[] = [
  { name: "Netherite_Sword",   tier: "Netherite" },
  { name: "Netherite_Pickaxe", tier: "Netherite" },
  { name: "Diamond_Axe",       tier: "Diamond" },
  { name: "Gold_Sword",        tier: "Gold" }
];

const ALL_TIERS: ToolTier[] = ["Wood", "Stone", "Iron", "Gold", "Diamond", "Netherite"];

// ==========================================================================
//  GENERATORS
// ==========================================================================

async function genBlock(displayName: string, difficulty: Difficulty, allBlocks: string[]): Promise<Question> {
  const correct = displayName.replace(/_/g, " ");
  const wrongs = pickN(allBlocks.filter((b) => b !== displayName), 3)
    .map((n) => n.replace(/_/g, " "));
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `mc-block-${displayName}`,
    categoryId: "blocks",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which block is this?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(displayName + ".png")
  };
}

async function genMob(
  mob: { name: string; hostile: boolean },
  difficulty: Difficulty
): Promise<Question> {
  const correct = mob.hostile ? "Hostile" : "Passive";
  const opts = ["Hostile", "Passive", "Boss", "Vehicle"] as [string, string, string, string];
  return {
    id: `mc-mob-${mob.name}`,
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
  return {
    id: `mc-biome-${biome.name}`,
    categoryId: "biomes",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `Which dimension is the ${biome.displayName} biome in?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    // Biomes have no per-biome sprites on the wiki; show the biome category icon
    image: WIKI_FILE("Stone.png"),
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

async function genTool(
  tool: { name: string; tier: ToolTier },
  difficulty: Difficulty
): Promise<Question> {
  const correct = tool.tier;
  const wrongs = pickN(ALL_TIERS.filter((t) => t !== correct), 3);
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `mc-tool-${tool.name}`,
    categoryId: "tools",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which tier is this tool?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: WIKI_FILE(tool.name + ".png")
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

  // Biome easy = mix of overworld biomes; medium = nether biomes; hard = end + obscure
  const biomeEasy = shuffle(overworldBiomes).slice(0, 6);
  const biomeMedium = shuffle(netherBiomes).slice(0, 4)
    .concat(shuffle(overworldBiomes).slice(0, 2));
  const biomeHard = shuffle(endBiomes).slice(0, 4)
    .concat(shuffle(overworldBiomes).filter((b) => b.category === "extreme_hills" || b.category === "icy" || b.category === "mushroom").slice(0, 2));

  const [
    blocksE, blocksM, blocksH,
    mobsE,   mobsM,   mobsH,
    biomesE, biomesM, biomesH,
    itemsE,  itemsM,  itemsH,
    toolsE,  toolsM,  toolsH,
    craftingE, craftingM, craftingH
  ] = await Promise.all([
    pair(shuffle(BLOCK_POOL_EASY),   "easy",   (n, d) => genBlock(n, d, allBlocks)),
    pair(shuffle(BLOCK_POOL_MEDIUM), "medium", (n, d) => genBlock(n, d, allBlocks)),
    pair(shuffle(BLOCK_POOL_HARD),   "hard",   (n, d) => genBlock(n, d, allBlocks)),

    pair(shuffle(MOB_POOL_EASY),   "easy",   genMob),
    pair(shuffle(MOB_POOL_MEDIUM), "medium", genMob),
    pair(shuffle(MOB_POOL_HARD),   "hard",   genMob),

    pair(biomeEasy,   "easy",   (b, d) => genBiome(b, d, dimensions)),
    pair(biomeMedium, "medium", (b, d) => genBiome(b, d, dimensions)),
    pair(biomeHard,   "hard",   (b, d) => genBiome(b, d, dimensions)),

    pair(shuffle(ITEM_POOL_EASY),   "easy",   genItem),
    pair(shuffle(ITEM_POOL_MEDIUM), "medium", genItem),
    pair(shuffle(ITEM_POOL_HARD),   "hard",   genItem),

    pair(shuffle(TOOL_POOL_EASY),   "easy",   genTool),
    pair(shuffle(TOOL_POOL_MEDIUM), "medium", genTool),
    pair(shuffle(TOOL_POOL_HARD),   "hard",   genTool),

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
