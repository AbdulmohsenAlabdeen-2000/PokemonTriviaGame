/**
 * Generates trivia questions at runtime from PokeAPI (https://pokeapi.co).
 *
 * Each question is built around a specific Pokémon (or ball item), and the
 * icon shown for that question is exactly the subject the question is about
 * — that's how we satisfy the "icon must match the question" requirement.
 *
 * The 6 generator types map to our 6 categories:
 *   1. Pokémon    — "What is this Pokémon's name?"          (sprite: Pokémon)
 *   2. Types      — "What is this Pokémon's primary type?"  (sprite: Pokémon)
 *   3. Evolutions — "What does this Pokémon evolve into?"   (sprite: pre-evo)
 *   4. Stats      — "What is this Pokémon's Pokédex number?"(sprite: Pokémon)
 *   5. Poké Balls — "What is this ball called?"             (sprite: ball)
 *   6. Colors     — "What color is this Pokémon?"           (sprite: Pokémon)
 *
 * All fetches are parallelised with Promise.all and run once at game start.
 */

import type { Question, Difficulty } from "../types";
import { POINTS_FOR } from "../types";

const POKE_API = "https://pokeapi.co/api/v2";

// ----- Curated Pokédex pools by difficulty (so easy = famous, hard = obscure)
const POOL_EASY = [
  1, 4, 7, 25, 6, 9, 39, 52, 113, 133, 150, 151, 143, 130, 144
];
const POOL_MEDIUM = [
  3, 8, 26, 38, 65, 68, 94, 121, 131, 145, 146, 149, 134, 135, 136, 248, 257, 282
];
const POOL_HARD = [
  227, 254, 376, 384, 445, 484, 487, 491, 530, 571, 658, 700, 716, 786, 887
];

/**
 * Evolution-only pools. Every Pokémon listed here is a PRE-evolution form
 * (i.e. evolves_to is non-empty in its evolution chain), which is what
 * genEvolution requires. Without this curated list the Evolutions category
 * was coming up short whenever the random pool happened to land on a
 * fully-evolved Pokémon — null returns can't fill a 6-tile column.
 */
const EVO_POOL_EASY = [
  1,   // Bulbasaur → Ivysaur
  4,   // Charmander → Charmeleon
  7,   // Squirtle → Wartortle
  25,  // Pikachu → Raichu
  39,  // Jigglypuff → Wigglytuff
  52,  // Meowth → Persian
  133, // Eevee → multiple
  16,  // Pidgey → Pidgeotto
  19,  // Rattata → Raticate
  23,  // Ekans → Arbok
  27,  // Sandshrew → Sandslash
  35   // Clefairy → Clefable
];
const EVO_POOL_MEDIUM = [
  2,   // Ivysaur → Venusaur
  5,   // Charmeleon → Charizard
  8,   // Wartortle → Blastoise
  17,  // Pidgeotto → Pidgeot
  30,  // Nidorina → Nidoqueen
  33,  // Nidorino → Nidoking
  41,  // Zubat → Golbat
  64,  // Kadabra → Alakazam
  67,  // Machoke → Machamp
  75,  // Graveler → Golem
  92,  // Gastly → Haunter
  93   // Haunter → Gengar
];
const EVO_POOL_HARD = [
  50,  // Diglett → Dugtrio
  60,  // Poliwag → Poliwhirl
  100, // Voltorb → Electrode
  111, // Rhyhorn → Rhydon
  116, // Horsea → Seadra
  118, // Goldeen → Seaking
  175, // Togepi → Togetic
  280, // Ralts → Kirlia
  296, // Makuhita → Hariyama
  446, // Munchlax → Snorlax
  447, // Riolu → Lucario
  519  // Pidove → Tranquill
];

const ITEM_POOL_EASY = [
  { slug: "poke-ball",  name: "Poké Ball" },
  { slug: "great-ball", name: "Great Ball" },
  { slug: "ultra-ball", name: "Ultra Ball" }
];
const ITEM_POOL_MEDIUM = [
  { slug: "master-ball",  name: "Master Ball" },
  { slug: "premier-ball", name: "Premier Ball" },
  { slug: "luxury-ball",  name: "Luxury Ball" }
];
const ITEM_POOL_HARD = [
  { slug: "net-ball",   name: "Net Ball" },
  { slug: "dive-ball",  name: "Dive Ball" },
  { slug: "quick-ball", name: "Quick Ball" },
  { slug: "dusk-ball",  name: "Dusk Ball" },
  { slug: "heal-ball",  name: "Heal Ball" }
];

// ----- API types (only the fields we read) -------------------------------
type PokeAPIPokemon = {
  id: number;
  name: string;
  height: number;       // decimeters
  weight: number;       // hectograms
  types: { type: { name: string } }[];
  sprites: {
    other?: {
      "official-artwork"?: { front_default?: string | null };
      home?: { front_default?: string | null };
    };
    front_default?: string | null;
  };
};

type EvoChainNode = {
  species: { name: string; url: string };
  evolves_to: EvoChainNode[];
};
type PokeAPISpecies = {
  id: number;
  name: string;
  color: { name: string };
  evolution_chain: { url: string };
};
type PokeAPIEvoChain = { chain: EvoChainNode };

type PokeAPIItem = {
  id: number;
  name: string;
  sprites: { default: string | null };
};

// ----- Helpers ------------------------------------------------------------
const cache = new Map<string, unknown>();
async function fetchJson<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokeAPI ${res.status} ${url}`);
  const data = (await res.json()) as T;
  cache.set(url, data);
  return data;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickN<T>(arr: T[], n: number, exclude: Set<T> = new Set()): T[] {
  const pool = arr.filter((x) => !exclude.has(x));
  return shuffle(pool).slice(0, n);
}

function capitalize(s: string) {
  return s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function spriteFor(p: PokeAPIPokemon): string {
  return (
    p.sprites.other?.["official-artwork"]?.front_default ||
    p.sprites.other?.home?.front_default ||
    p.sprites.front_default ||
    ""
  );
}

// ----- The 18 official Pokémon types --------------------------------------
const ALL_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison",
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
  "Steel", "Fairy"
];

// ----- The colors PokeAPI uses on /pokemon-species -----------------------
const ALL_COLORS = [
  "Red", "Blue", "Yellow", "Green", "Black", "Brown",
  "Purple", "Gray", "White", "Pink"
];

// ==========================================================================
//  GENERATORS
// ==========================================================================

async function genName(
  pokemonId: number,
  difficulty: Difficulty,
  pool: number[]
): Promise<Question> {
  const p = await fetchJson<PokeAPIPokemon>(`${POKE_API}/pokemon/${pokemonId}`);
  const name = capitalize(p.name);
  // Pull 3 wrong names from the same difficulty pool
  const otherIds = pool.filter((id) => id !== pokemonId);
  const others = await Promise.all(
    pickN(otherIds, 3).map((id) => fetchJson<PokeAPIPokemon>(`${POKE_API}/pokemon/${id}`))
  );
  const wrongNames = others.map((o) => capitalize(o.name));
  const opts = shuffle([name, ...wrongNames]) as [string, string, string, string];
  return {
    id: `gen-name-${pokemonId}`,
    categoryId: "pokemon",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "What is the name of this Pokémon?",
    options: opts,
    answerIndex: opts.indexOf(name) as 0 | 1 | 2 | 3,
    image: spriteFor(p)
  };
}

async function genType(
  pokemonId: number,
  difficulty: Difficulty
): Promise<Question> {
  const p = await fetchJson<PokeAPIPokemon>(`${POKE_API}/pokemon/${pokemonId}`);
  const correctType = capitalize(p.types[0].type.name);
  const wrongs = pickN(ALL_TYPES, 3, new Set([correctType]));
  const opts = shuffle([correctType, ...wrongs]) as [string, string, string, string];
  return {
    id: `gen-type-${pokemonId}`,
    categoryId: "types",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What is ${capitalize(p.name)}'s primary type?`,
    options: opts,
    answerIndex: opts.indexOf(correctType) as 0 | 1 | 2 | 3,
    image: spriteFor(p)
  };
}

async function genEvolution(
  pokemonId: number,
  difficulty: Difficulty,
  pool: number[]
): Promise<Question | null> {
  const species = await fetchJson<PokeAPISpecies>(
    `${POKE_API}/pokemon-species/${pokemonId}`
  );
  const chain = await fetchJson<PokeAPIEvoChain>(species.evolution_chain.url);
  // Find this species in the chain and read its first evolves_to entry.
  function find(node: EvoChainNode): EvoChainNode | null {
    if (node.species.name === species.name) return node;
    for (const next of node.evolves_to) {
      const r = find(next);
      if (r) return r;
    }
    return null;
  }
  const me = find(chain.chain);
  if (!me || me.evolves_to.length === 0) return null; // no next-evo to ask about

  const nextName = capitalize(me.evolves_to[0].species.name);
  const myPoke = await fetchJson<PokeAPIPokemon>(`${POKE_API}/pokemon/${pokemonId}`);

  // Wrong options: 3 pokemon names from the same pool that are NOT the answer
  const otherIds = pool.filter((id) => id !== pokemonId);
  const others = await Promise.all(
    pickN(otherIds, 3).map((id) => fetchJson<PokeAPIPokemon>(`${POKE_API}/pokemon/${id}`))
  );
  const wrongNames = others.map((o) => capitalize(o.name)).filter((n) => n !== nextName);
  while (wrongNames.length < 3) wrongNames.push(`???-${wrongNames.length}`);
  const opts = shuffle([nextName, ...wrongNames.slice(0, 3)]) as [string, string, string, string];
  return {
    id: `gen-evo-${pokemonId}`,
    categoryId: "evolutions", // we keep the slot but rebrand label in CATEGORIES
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What does ${capitalize(myPoke.name)} evolve into?`,
    options: opts,
    answerIndex: opts.indexOf(nextName) as 0 | 1 | 2 | 3,
    image: spriteFor(myPoke)
  };
}

async function genStat(
  pokemonId: number,
  difficulty: Difficulty
): Promise<Question> {
  const p = await fetchJson<PokeAPIPokemon>(`${POKE_API}/pokemon/${pokemonId}`);
  // Ask for the Pokédex number — distractors are nearby IDs
  const correct = String(p.id);
  const distractorIds = new Set<number>();
  while (distractorIds.size < 3) {
    const offset = Math.floor(Math.random() * 60) - 30;
    const candidate = p.id + offset;
    if (candidate > 0 && candidate !== p.id && candidate < 1010) distractorIds.add(candidate);
  }
  const wrongs = Array.from(distractorIds).map(String);
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `gen-stat-${pokemonId}`,
    categoryId: "pokedex", // slot reused; label rebranded in CATEGORIES
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What is ${capitalize(p.name)}'s National Pokédex number?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: spriteFor(p)
  };
}

async function genBall(
  ball: { slug: string; name: string },
  difficulty: Difficulty,
  allBalls: { slug: string; name: string }[]
): Promise<Question> {
  const item = await fetchJson<PokeAPIItem>(`${POKE_API}/item/${ball.slug}`);
  const correct = ball.name;
  const wrongs = pickN(allBalls.map((b) => b.name), 3, new Set([correct]));
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `gen-ball-${ball.slug}`,
    categoryId: "balls",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which Poké Ball is shown here?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: item.sprites.default || ""
  };
}

async function genColor(
  pokemonId: number,
  difficulty: Difficulty
): Promise<Question> {
  const species = await fetchJson<PokeAPISpecies>(
    `${POKE_API}/pokemon-species/${pokemonId}`
  );
  const p = await fetchJson<PokeAPIPokemon>(`${POKE_API}/pokemon/${pokemonId}`);
  const correct = capitalize(species.color.name);
  const wrongs = pickN(ALL_COLORS, 3, new Set([correct]));
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `gen-color-${pokemonId}`,
    categoryId: "colors",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What color is ${capitalize(p.name)} (per the Pokédex)?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: spriteFor(p)
  };
}

// ==========================================================================
//  ENTRY POINT
// ==========================================================================

/**
 * Build the full set of 36 questions for one game by fetching from PokeAPI.
 * Returns an array of 6 categories × 6 questions each (2 easy, 2 medium, 2 hard).
 */
export async function buildGameQuestionsFromAPI(): Promise<Question[]> {
  const easyIds   = shuffle(POOL_EASY).slice(0, 12);
  const mediumIds = shuffle(POOL_MEDIUM).slice(0, 12);
  const hardIds   = shuffle(POOL_HARD).slice(0, 12);

  const allBalls = [...ITEM_POOL_EASY, ...ITEM_POOL_MEDIUM, ...ITEM_POOL_HARD];

  // Curated pools used ONLY for evolution questions — every entry has a
  // next evolution, so genEvolution can't return null on these.
  const evoEasyIds   = shuffle(EVO_POOL_EASY).slice(0, 12);
  const evoMediumIds = shuffle(EVO_POOL_MEDIUM).slice(0, 12);
  const evoHardIds   = shuffle(EVO_POOL_HARD).slice(0, 12);

  /**
   * Try generators in sequence until we get `needed` questions. Each
   * individual generator call is wrapped in try/catch so a single PokeAPI
   * blip (network glitch, 5xx) can't shrink an entire category — we just
   * skip the failed id and try the next one in the pool.
   */
  async function pair(
    pool: number[],
    difficulty: Difficulty,
    gen: (id: number, d: Difficulty, pool: number[]) => Promise<Question | null>,
    needed = 2
  ): Promise<Question[]> {
    const out: Question[] = [];
    for (let i = 0; i < pool.length && out.length < needed; i++) {
      try {
        const q = await gen(pool[i], difficulty, pool);
        if (q) out.push(q);
      } catch {
        // skip this id and try the next one
      }
    }
    return out;
  }

  const [
    namesE, namesM, namesH,
    typesE, typesM, typesH,
    evosE,  evosM,  evosH,
    statsE, statsM, statsH,
    ballsE, ballsM, ballsH,
    colsE,  colsM,  colsH
  ] = await Promise.all([
    pair(easyIds.slice(0, 6),   "easy",   genName),
    pair(mediumIds.slice(0, 6), "medium", genName),
    pair(hardIds.slice(0, 6),   "hard",   genName),

    pair(easyIds.slice(4, 10),  "easy",   genType),
    pair(mediumIds.slice(4, 10),"medium", genType),
    pair(hardIds.slice(4, 10),  "hard",   genType),

    pair(evoEasyIds,   "easy",   genEvolution, 2),
    pair(evoMediumIds, "medium", genEvolution, 2),
    pair(evoHardIds,   "hard",   genEvolution, 2),

    pair(easyIds.slice(6, 12),  "easy",   genStat),
    pair(mediumIds.slice(6, 12),"medium", genStat),
    pair(hardIds.slice(6, 12),  "hard",   genStat),

    Promise.all(ITEM_POOL_EASY.slice(0, 2).map((b) => genBall(b, "easy",   allBalls))),
    Promise.all(ITEM_POOL_MEDIUM.slice(0, 2).map((b) => genBall(b, "medium", allBalls))),
    Promise.all(ITEM_POOL_HARD.slice(0, 2).map((b) => genBall(b, "hard",    allBalls))),

    pair(easyIds.slice(0, 6),   "easy",   genColor),
    pair(mediumIds.slice(0, 6), "medium", genColor),
    pair(hardIds.slice(0, 6),   "hard",   genColor)
  ]);

  return [
    ...namesE, ...namesM, ...namesH,
    ...typesE, ...typesM, ...typesH,
    ...evosE,  ...evosM,  ...evosH,
    ...statsE, ...statsM, ...statsH,
    ...ballsE, ...ballsM, ...ballsH,
    ...colsE,  ...colsM,  ...colsH
  ];
}
