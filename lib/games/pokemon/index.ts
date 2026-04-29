/**
 * Pokémon GameConfig.
 *
 * Bundles the Pokémon-specific theme, music, categories, starter loadouts,
 * and the PokeAPI-driven question generator into a single object that the
 * game-agnostic UI plugs into.
 */

import type { GameConfig } from "../types";
import { ICON_EVOLUTION, ICON_TYPES, ICON_POKEDEX, ICON_COLORS } from "./icons";
import { STARTERS, spriteFor } from "./pokedex";
import { buildGameQuestionsFromAPI } from "./questions";

const POKE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const ITEM = (slug: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;

export const pokemonGame: GameConfig = {
  id: "pokemon",
  name: "Pokémon",
  tagline: "Catch every category — six trivia categories, escalating points",
  description:
    "Two Trainers face off across 36 Pokémon-themed questions: name the silhouettes, " +
    "identify types, recall evolutions, name the Poké Balls, and more. Powered live by " +
    "PokeAPI — every game is freshly randomised.",
  splash: POKE(25),         // Pikachu hero shot
  splashAlt: "Pikachu",

  theme: {
    bodyAttr: "pokemon",
    primary:    "#ee1515",
    primaryDark:"#b30000",
    accent:     "#ffd700",
    accentDark: "#c9a800",
    blue:       "#0051ba",
    bgGradient:
      "radial-gradient(circle at 20% 10%, #fff7c2 0%, transparent 40%)," +
      "radial-gradient(circle at 85% 15%, #cde7ff 0%, transparent 45%)," +
      "radial-gradient(circle at 50% 95%, #ffd0d0 0%, transparent 50%)," +
      "linear-gradient(180deg, #fff8e1 0%, #fde6f0 100%)"
  },

  music: {
    lobby:   "l490gxtJMW4",
    battle:  "PfDhKzpUieA",
    correct: "zhCXcOGhy4c",
    winner:  "nyINomMu61E"
  },

  categories: [
    { id: "pokemon",    label: "Pokémon",    icon: POKE(25),          iconAlt: "Pikachu" },
    { id: "types",      label: "Types",      icon: ICON_TYPES,        iconAlt: "Type colour wheel" },
    { id: "evolutions", label: "Evolutions", icon: ICON_EVOLUTION,    iconAlt: "Evolution sparkle" },
    { id: "pokedex",    label: "Pokédex",    icon: ICON_POKEDEX,      iconAlt: "Pokédex device" },
    { id: "balls",      label: "Poké Balls", icon: ITEM("poke-ball"), iconAlt: "Poké Ball", iconStyle: "pixel" },
    { id: "colors",     label: "Colors",     icon: ICON_COLORS,       iconAlt: "Painter's palette" }
  ],

  tileIcons: {
    easy:   ITEM("poke-ball"),
    medium: ITEM("great-ball"),
    hard:   ITEM("ultra-ball"),
    iconStyle: "pixel"
  },

  starters: {
    title: "Choose your starter Pokémon",
    items: STARTERS.map((s) => ({
      id: s.id,
      name: s.name,
      image: spriteFor(s.dexId),
      badge: s.type,
      badgeClass: s.typeClass,
      blurb: s.blurb
    }))
  },

  buildQuestions: buildGameQuestionsFromAPI
};
