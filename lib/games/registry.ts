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

export type GameEntry = {
  config: GameConfig;
  playable: boolean;
};

const minecraftPlaceholder: GameConfig = {
  id: "minecraft",
  name: "Minecraft",
  tagline: "Coming next — blocky trivia from PrismarineJS data",
  description:
    "Test your overworld instincts: name the mob, the biome, the block, the tool. " +
    "Live data sourced from the PrismarineJS minecraft-data project.",
  // Real isometric Grass Block sprite served by minecraft.wiki's Special:FilePath
  // (returns image/png with hotlink-friendly headers).
  splash: "https://minecraft.wiki/Special:FilePath/Grass_Block_JE7_BE6.png",
  splashAlt: "Minecraft grass block",
  theme: {
    bodyAttr: "minecraft",
    primary:    "#5b8a3a",
    primaryDark:"#3e6028",
    accent:     "#ffd35a",
    accentDark: "#bd9a35",
    blue:       "#3a6ec1",
    bgGradient: "linear-gradient(180deg, #c0e2a5 0%, #8ec06c 60%, #6f9356 100%)"
  },
  music: { lobby: null, battle: null, correct: null, winner: null },
  categories: [],
  starters: { title: "", items: [] },
  buildQuestions: async () => []
};

const arcRaidersPlaceholder: GameConfig = {
  id: "arc-raiders",
  name: "ARC Raiders",
  tagline: "Coming next — surface-side trivia from MetaForge",
  description:
    "Salvage your way through 36 questions about ARC Raiders' weapons, items, traders, " +
    "quests, and the deadly ARC machines themselves. Live data from MetaForge.",
  // The "Bastion" ARC — iconic heavy minigun unit, the most recognisable
  // ARC enemy in the game. Image served by MetaForge.
  splash: "https://unhbvkszwhczbjxgetgk.supabase.co/storage/v1/object/public/images/arc-raiders/icons/bastion.webp",
  splashAlt: "ARC Raiders Bastion enemy",
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
  { config: pokemonGame,           playable: true },
  { config: minecraftPlaceholder,  playable: false },
  { config: arcRaidersPlaceholder, playable: false }
];

export function gameById(id: string): GameConfig | null {
  return GAMES.find((g) => g.config.id === id)?.config ?? null;
}
