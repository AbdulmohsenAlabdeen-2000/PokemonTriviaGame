/**
 * Registry of all games available in the trivia app.
 *
 * Currently:
 *   - pokemon     fully implemented (PokeAPI)
 *   - minecraft   coming-soon stub (will be wired in Phase 2)
 *   - arc-raiders coming-soon stub (will be wired in Phase 3)
 *
 * Each entry has `playable: true` once its question generator is wired up;
 * un-playable games still show on the GameSelect screen but are click-locked
 * with a "coming soon" badge.
 */

import type { GameConfig } from "./types";
import { pokemonGame } from "./pokemon";
import { minecraftGame } from "./minecraft";

export type GameEntry = {
  config: GameConfig;
  playable: boolean;
};

const arcRaidersPlaceholder: GameConfig = {
  id: "arc-raiders",
  name: "ARC Raiders",
  tagline: "Coming next — surface-side trivia from MetaForge",
  description:
    "Salvage your way through 36 questions about ARC Raiders' weapons, items, traders, " +
    "quests, and the deadly ARC machines themselves. Live data from MetaForge.",
  // Official ARC Raiders cover art, served by Wikimedia's Special:FilePath
  // (resolves to a hot-link-friendly image/jpeg with the standard thumb size).
  splash: "https://en.wikipedia.org/wiki/Special:FilePath/Arc_Raiders_cover_art.jpg",
  splashAlt: "ARC Raiders cover art",
  theme: {
    bodyAttr: "arc-raiders",
    primary:    "#d4a14a",
    primaryDark:"#9c7028",
    accent:     "#7ec3ff",
    accentDark: "#4a8fc8",
    blue:       "#1f3a5b",
    bgGradient: "linear-gradient(180deg, #1c2330 0%, #2d3848 50%, #4a5566 100%)"
  },
  music: { lobby: null, battle: null, correct: null, winner: null },
  categories: [],
  starters: { title: "", items: [] },
  buildQuestions: async () => []
};

export const GAMES: GameEntry[] = [
  { config: pokemonGame,           playable: true  },
  { config: minecraftGame,         playable: true  },
  { config: arcRaidersPlaceholder, playable: false }
];

export function gameById(id: string): GameConfig | null {
  return GAMES.find((g) => g.config.id === id)?.config ?? null;
}
