/**
 * Trivia type definitions + category metadata.
 *
 * The actual questions are now generated at runtime from PokeAPI — see
 * lib/trivia-generator.ts. This file only holds the shared types, the
 * scoring constants, and the category headers shown on the board.
 */

export type Category =
  | "Pokemon"
  | "Types"
  | "Gyms"        // re-purposed as "Evolutions"
  | "Characters"  // re-purposed as "Pokédex"
  | "PokeBalls"
  | "Colors";

export type Difficulty = "easy" | "medium" | "hard";

export const POINTS_FOR: Record<Difficulty, 200 | 400 | 600> = {
  easy: 200, medium: 400, hard: 600
};

/** Penalty applied when the player answers a HARD question wrong. */
export const HARD_WRONG_PENALTY = -100;

export type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  value: 200 | 400 | 600;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  image: string;
};

const POKE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const ITEM = (slug: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;

/**
 * Category headers for the board. Labels reflect what each generator asks:
 *  - Pokémon    → "name this Pokémon"
 *  - Types      → "what type is this Pokémon"
 *  - Evolutions → "what does this evolve into" (uses the "Gyms" id slot)
 *  - Pokédex    → "what is its Pokédex number" (uses the "Characters" id slot)
 *  - Poké Balls → "name this ball"
 *  - Colors     → "what color is this Pokémon"
 */
export const CATEGORIES: {
  id: Category;
  label: string;
  icon: string;
  iconAlt: string;
  /** Pokedex id whose cry could be played for this category */
  cryId: number;
}[] = [
  { id: "Pokemon",    label: "Pokémon",     icon: POKE(25),  iconAlt: "Pikachu",   cryId: 25  },
  { id: "Types",      label: "Types",       icon: POKE(133), iconAlt: "Eevee",     cryId: 133 },
  { id: "Gyms",       label: "Evolutions",  icon: POKE(133), iconAlt: "Eevee",     cryId: 133 },
  { id: "Characters", label: "Pokédex",     icon: POKE(151), iconAlt: "Mew",       cryId: 151 },
  { id: "PokeBalls",  label: "Poké Balls",  icon: ITEM("poke-ball"), iconAlt: "Poké Ball", cryId: 7 },
  { id: "Colors",     label: "Colors",      icon: POKE(1),   iconAlt: "Bulbasaur", cryId: 1   }
];

export function categoryMeta(id: Category) {
  return CATEGORIES.find((c) => c.id === id)!;
}
