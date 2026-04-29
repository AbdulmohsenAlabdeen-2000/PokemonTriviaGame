/**
 * Counter-Strike 2 trivia generators.
 *
 * Live data: ByMykel/CSGO-API on GitHub raw — pure JSON, no key required.
 *   - skins.json   ~2000 skins with weapon, category, pattern, rarity, image
 *   - stickers.json all stickers with type/event/rarity
 *   - crates.json  weapon cases, souvenir packs
 *
 * Six categories matching the spec:
 *   1. Weapons    — "Which weapon is this skin for?"  (skin sprite, weapon name distractors)
 *   2. Knives     — "Which knife is this?"            (knife skin sprite, knife model names)
 *   3. Rarity     — "What rarity is this skin?"       (Consumer / Mil-Spec / Covert / etc.)
 *   4. Stickers   — "What is this sticker called?"    (sticker sprite, name distractors)
 *   5. Maps       — curated map trivia (active duty, locations, callouts)
 *   6. Items      — "Which case/crate is this?"       (case sprite, name distractors)
 */

import type { Question, Difficulty } from "../types";
import { POINTS_FOR } from "../types";

const CSGO_API = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";

// ----- API shapes (only the fields we read) ------------------------------
type CSSkin = {
  id: string;
  name: string;
  weapon?: { id: string; name: string };
  category?: { id: string; name: string };
  rarity?: { id: string; name: string; color: string };
  image: string | null;
};
type CSSticker = {
  id: string;
  name: string;
  rarity?: { id: string; name: string };
  image: string | null;
  type?: string;
};
type CSCrate = {
  id: string;
  name: string;
  image: string | null;
  rarity?: { id: string; name: string };
};

// ----- Network cache -----------------------------------------------------
const cache = new Map<string, unknown>();
async function fetchJson<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`CSGO-API ${r.status} ${url}`);
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

// Standard CS2 skin rarities (low → high)
const ALL_RARITIES = [
  "Consumer Grade", "Industrial Grade", "Mil-Spec Grade",
  "Restricted", "Classified", "Covert", "Contraband"
];

// ----- Difficulty bucketing for skins/stickers ---------------------------
// Cheaper / lower-tier rarity = easier; rarer = harder.
function difficultyForRarity(rarity?: string): Difficulty {
  if (!rarity) return "easy";
  if (rarity === "Consumer Grade" || rarity === "Industrial Grade") return "easy";
  if (rarity === "Mil-Spec Grade" || rarity === "Restricted") return "medium";
  return "hard"; // Classified / Covert / Contraband / Extraordinary
}

// ==========================================================================
//  GENERATORS
// ==========================================================================

function genWeapon(skin: CSSkin, difficulty: Difficulty, allWeaponNames: string[]): Question | null {
  if (!skin.weapon || !skin.image) return null;
  const correct = skin.weapon.name;
  const wrongs = pickN(allWeaponNames.filter((n) => n !== correct), 3);
  if (wrongs.length < 3) return null;
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `cs-weapon-${skin.id}`,
    categoryId: "weapons",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which weapon does this skin belong to?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: skin.image,
    preventSilhouette: true
  };
}

function genKnife(skin: CSSkin, difficulty: Difficulty, allKnifeNames: string[]): Question | null {
  if (!skin.weapon || !skin.image) return null;
  const correct = skin.weapon.name;
  const wrongs = pickN(allKnifeNames.filter((n) => n !== correct), 3);
  if (wrongs.length < 3) return null;
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `cs-knife-${skin.id}`,
    categoryId: "knives",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which knife is this?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: skin.image,
    preventSilhouette: true
  };
}

function genRarity(skin: CSSkin, difficulty: Difficulty): Question | null {
  if (!skin.rarity || !skin.image) return null;
  const correct = skin.rarity.name;
  if (!ALL_RARITIES.includes(correct)) return null;
  const wrongs = pickN(ALL_RARITIES, 3, new Set([correct]));
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `cs-rarity-${skin.id}`,
    categoryId: "rarity",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: `What is the rarity of "${skin.name}"?`,
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: skin.image,
    preventSilhouette: true
  };
}

function genSticker(sticker: CSSticker, difficulty: Difficulty, allNames: string[]): Question | null {
  if (!sticker.image || !sticker.name) return null;
  // Strip "Sticker | " prefix from the answer for cleaner readability
  const correct = sticker.name.replace(/^Sticker \| /, "");
  const wrongs = pickN(
    allNames.map((n) => n.replace(/^Sticker \| /, "")).filter((n) => n !== correct),
    3
  );
  if (wrongs.length < 3) return null;
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `cs-sticker-${sticker.id}`,
    categoryId: "stickers",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "What is this sticker called?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: sticker.image,
    preventSilhouette: true
  };
}

function genCrate(crate: CSCrate, difficulty: Difficulty, allCrateNames: string[]): Question | null {
  if (!crate.image || !crate.name) return null;
  const correct = crate.name;
  const wrongs = pickN(allCrateNames.filter((n) => n !== correct), 3);
  if (wrongs.length < 3) return null;
  const opts = shuffle([correct, ...wrongs]) as [string, string, string, string];
  return {
    id: `cs-crate-${crate.id}`,
    categoryId: "items",
    difficulty,
    value: POINTS_FOR[difficulty],
    prompt: "Which CS2 case is this?",
    options: opts,
    answerIndex: opts.indexOf(correct) as 0 | 1 | 2 | 3,
    image: crate.image,
    preventSilhouette: true
  };
}

// ----- Curated map trivia -------------------------------------------------
// CS2 maps don't have a public icon endpoint we can rely on, so the Maps
// category uses curated facts shown alongside the active-duty map pool.
const MAPS_ICON = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/maps.json";
const MAP_TRIVIA: { difficulty: Difficulty; prompt: string; correct: string; wrongs: string[] }[] = [
  // --- Easy ---
  { difficulty: "easy",
    prompt: "Which CS2 map features the iconic 'Banana' chokepoint between the bombsites?",
    correct: "Inferno", wrongs: ["Mirage", "Dust II", "Nuke"] },
  { difficulty: "easy",
    prompt: "On which map are A and B sites linked by 'Mid' through doors and connector?",
    correct: "Mirage", wrongs: ["Dust II", "Anubis", "Vertigo"] },
  // --- Medium ---
  { difficulty: "medium",
    prompt: "Which map has bombsite A on top of B (vertical layout in a Russian power plant)?",
    correct: "Nuke", wrongs: ["Vertigo", "Train", "Overpass"] },
  { difficulty: "medium",
    prompt: "Which CS2 map is set on a high-rise construction site with a sky-bridge approach?",
    correct: "Vertigo", wrongs: ["Nuke", "Office", "Overpass"] },
  // --- Hard ---
  { difficulty: "hard",
    prompt: "Which active-duty map is set in ancient Egyptian ruins?",
    correct: "Anubis", wrongs: ["Ancient", "Mirage", "Cache"] },
  { difficulty: "hard",
    prompt: "Which active-duty map is themed around a Mayan jungle temple?",
    correct: "Ancient", wrongs: ["Anubis", "Inferno", "Aztec"] }
];

function genMapTrivia(
  q: typeof MAP_TRIVIA[number]
): Question {
  const opts = shuffle([q.correct, ...q.wrongs]) as [string, string, string, string];
  return {
    id: `cs-map-${q.prompt.slice(0, 24)}`,
    categoryId: "maps",
    difficulty: q.difficulty,
    value: POINTS_FOR[q.difficulty],
    prompt: q.prompt,
    options: opts,
    answerIndex: opts.indexOf(q.correct) as 0 | 1 | 2 | 3,
    image: MAPS_ICON, // fallback; the question's prompt carries the map name
    preventSilhouette: true
  };
}

// ==========================================================================
//  ENTRY POINT
// ==========================================================================

export async function buildCS2Questions(): Promise<Question[]> {
  const [skins, stickers, crates] = await Promise.all([
    fetchJson<CSSkin[]>(`${CSGO_API}/skins.json`),
    fetchJson<CSSticker[]>(`${CSGO_API}/stickers.json`),
    fetchJson<CSCrate[]>(`${CSGO_API}/crates.json`)
  ]);

  // ----- Filter / partition skins -----
  const playableSkins = skins.filter(
    (s) => s.weapon && s.image && s.rarity?.name && ALL_RARITIES.includes(s.rarity.name)
  );
  const knifeSkins   = playableSkins.filter((s) => s.category?.name === "Knives");
  const weaponSkins  = playableSkins.filter((s) => s.category?.name !== "Knives" && s.category?.name !== "Gloves");
  // Distinct names for distractor pools
  const allWeaponNames = Array.from(new Set(weaponSkins.map((s) => s.weapon!.name)));
  const allKnifeNames  = Array.from(new Set(knifeSkins.map((s) => s.weapon!.name)));
  // Bucket by difficulty (rarity)
  const weaponEasy   = weaponSkins.filter((s) => difficultyForRarity(s.rarity?.name) === "easy");
  const weaponMedium = weaponSkins.filter((s) => difficultyForRarity(s.rarity?.name) === "medium");
  const weaponHard   = weaponSkins.filter((s) => difficultyForRarity(s.rarity?.name) === "hard");
  const knifeEasy   = knifeSkins.filter((s) => difficultyForRarity(s.rarity?.name) === "easy");
  const knifeMedium = knifeSkins.filter((s) => difficultyForRarity(s.rarity?.name) === "medium");
  const knifeHard   = knifeSkins.filter((s) => difficultyForRarity(s.rarity?.name) === "hard");
  // Knives are mostly Covert/Extraordinary so easy/medium can be empty —
  // fall back to picking any knife if a bucket is short.
  const knifeFallback = knifeSkins;

  // Stickers
  const playableStickers = stickers.filter((s) => s.image && s.name);
  // Stickers don't all have a useful rarity scale — just split into thirds
  const shuffledStickers = shuffle(playableStickers);
  const sThird = Math.ceil(playableStickers.length / 3);
  const stickersEasy   = shuffledStickers.slice(0, sThird);
  const stickersMedium = shuffledStickers.slice(sThird, sThird * 2);
  const stickersHard   = shuffledStickers.slice(sThird * 2);
  const allStickerNames = playableStickers.map((s) => s.name);

  // Crates / cases
  const playableCrates = crates.filter((c) => c.image && c.name);
  const shuffledCrates = shuffle(playableCrates);
  const cThird = Math.ceil(playableCrates.length / 3);
  const cratesEasy   = shuffledCrates.slice(0, cThird);
  const cratesMedium = shuffledCrates.slice(cThird, cThird * 2);
  const cratesHard   = shuffledCrates.slice(cThird * 2);
  const allCrateNames = playableCrates.map((c) => c.name);

  // ----- Helper: build N questions from a pool with a generator -----
  function pair<T>(
    pool: T[],
    difficulty: Difficulty,
    gen: (item: T, d: Difficulty) => Question | null,
    needed = 2
  ): Question[] {
    const out: Question[] = [];
    const shuffled = shuffle(pool);
    for (let i = 0; i < shuffled.length && out.length < needed; i++) {
      try {
        const q = gen(shuffled[i], difficulty);
        if (q) out.push(q);
      } catch { /* skip */ }
    }
    return out;
  }

  // Generators that close over distractor pools
  const genWeaponX  = (s: CSSkin, d: Difficulty) => genWeapon(s, d, allWeaponNames);
  const genKnifeX   = (s: CSSkin, d: Difficulty) => genKnife(s, d, allKnifeNames);
  const genRarityX  = (s: CSSkin, d: Difficulty) => genRarity(s, d);
  const genStickerX = (s: CSSticker, d: Difficulty) => genSticker(s, d, allStickerNames);
  const genCrateX   = (c: CSCrate, d: Difficulty) => genCrate(c, d, allCrateNames);

  const [
    weaponsE, weaponsM, weaponsH,
    knivesE,  knivesM,  knivesH,
    rarityE,  rarityM,  rarityH,
    stickE,   stickM,   stickH,
    mapE,     mapM,     mapH,
    itemE,    itemM,    itemH
  ] = await Promise.all([
    pair(weaponEasy,   "easy",   genWeaponX),
    pair(weaponMedium, "medium", genWeaponX),
    pair(weaponHard,   "hard",   genWeaponX),

    pair(knifeEasy.length >= 2 ? knifeEasy : knifeFallback,   "easy",   genKnifeX),
    pair(knifeMedium.length >= 2 ? knifeMedium : knifeFallback, "medium", genKnifeX),
    pair(knifeHard.length >= 2 ? knifeHard : knifeFallback,   "hard",   genKnifeX),

    pair(weaponEasy,   "easy",   genRarityX),
    pair(weaponMedium, "medium", genRarityX),
    pair(weaponHard,   "hard",   genRarityX),

    pair(stickersEasy,   "easy",   genStickerX),
    pair(stickersMedium, "medium", genStickerX),
    pair(stickersHard,   "hard",   genStickerX),

    Promise.resolve(MAP_TRIVIA.filter((m) => m.difficulty === "easy").map(genMapTrivia)),
    Promise.resolve(MAP_TRIVIA.filter((m) => m.difficulty === "medium").map(genMapTrivia)),
    Promise.resolve(MAP_TRIVIA.filter((m) => m.difficulty === "hard").map(genMapTrivia)),

    pair(cratesEasy,   "easy",   genCrateX),
    pair(cratesMedium, "medium", genCrateX),
    pair(cratesHard,   "hard",   genCrateX)
  ]);

  return [
    ...weaponsE, ...weaponsM, ...weaponsH,
    ...knivesE,  ...knivesM,  ...knivesH,
    ...rarityE,  ...rarityM,  ...rarityH,
    ...stickE,   ...stickM,   ...stickH,
    ...mapE,     ...mapM,     ...mapH,
    ...itemE,    ...itemM,    ...itemH
  ];
}
