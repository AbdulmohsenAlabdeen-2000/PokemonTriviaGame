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

import { ICON_EVOLUTION, ICON_TYPES, ICON_POKEDEX, ICON_COLORS } from "./icons";

/**
 * Category headers for the board. Labels reflect what each generator asks:
 *  - Pokémon    → "name this Pokémon"           (Pikachu sprite from PokeAPI)
 *  - Types      → "what type is this Pokémon"   (six-segment colour wheel SVG)
 *  - Evolutions → "what does this evolve into"  (evolution-flash sparkle SVG)
 *  - Pokédex    → "what is its Pokédex number"  (Pokédex device SVG)
 *  - Poké Balls → "name this ball"              (Poké Ball item from PokeAPI)
 *  - Colors     → "what color is this Pokémon"  (painter's palette SVG)
 *
 * Note: the "Gyms" / "Characters" id slots are kept for backwards compat with
 * existing question data — they're rebranded as Evolutions / Pokédex via the
 * label field.
 */
export const CATEGORIES: {
  id: Category;
  label: string;
  icon: string;
  iconAlt: string;
  /** Pokedex id whose cry could be played for this category */
  cryId: number;
}[] = [
  { id: "Pokemon",    label: "Pokémon",     icon: POKE(25),          iconAlt: "Pikachu",            cryId: 25  },
  { id: "Types",      label: "Types",       icon: ICON_TYPES,        iconAlt: "Type colour wheel",  cryId: 133 },
  { id: "Gyms",       label: "Evolutions",  icon: ICON_EVOLUTION,    iconAlt: "Evolution sparkle",  cryId: 133 },
  { id: "Characters", label: "Pokédex",     icon: ICON_POKEDEX,      iconAlt: "Pokédex device",     cryId: 151 },
  { id: "PokeBalls",  label: "Poké Balls",  icon: ITEM("poke-ball"), iconAlt: "Poké Ball",          cryId: 7   },
  { id: "Colors",     label: "Colors",      icon: ICON_COLORS,       iconAlt: "Painter's palette",  cryId: 1   }
];

export function categoryMeta(id: Category) {
  return CATEGORIES.find((c) => c.id === id)!;
}
