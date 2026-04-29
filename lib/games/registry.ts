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

/**
 * Inline SVG of a Minecraft-style grass block. mcasset.cloud serves an HTML
 * wrapper page instead of the raw PNG (anti-hotlink protection), so we draw
 * our own pixelated block in SVG and embed it as a data URI.
 */
const MC_GRASS_BLOCK_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96' shape-rendering='crispEdges'>
    <!-- top face -->
    <polygon points='48,4 92,28 48,52 4,28' fill='#7bba47' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
    <polygon points='14,24 28,16 36,20 22,28' fill='#69a83b' opacity='0.6'/>
    <polygon points='60,18 70,12 76,15 66,22' fill='#69a83b' opacity='0.6'/>
    <!-- left face -->
    <polygon points='4,28 48,52 48,90 4,66' fill='#8b5a2b' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
    <rect x='4' y='28' width='44' height='10' fill='#5b8a3a'/>
    <polygon points='4,28 48,52 48,38 4,18' fill='#5b8a3a' opacity='0.6'/>
    <polygon points='4,28 48,52 48,38 4,18' fill='#5b8a3a' opacity='0' transform='translate(0 10)'/>
    <!-- right face -->
    <polygon points='48,52 92,28 92,66 48,90' fill='#a06b35' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
    <polygon points='48,52 92,28 92,38 48,62' fill='#6da045'/>
    <!-- pixel highlights -->
    <rect x='14' y='42' width='6' height='6' fill='#704020' opacity='0.5'/>
    <rect x='28' y='62' width='6' height='6' fill='#704020' opacity='0.5'/>
    <rect x='62' y='52' width='6' height='6' fill='#704020' opacity='0.4'/>
    <rect x='78' y='42' width='6' height='6' fill='#704020' opacity='0.4'/>
  </svg>`
);

const minecraftPlaceholder: GameConfig = {
  id: "minecraft",
  name: "Minecraft",
  tagline: "Coming next — blocky trivia from PrismarineJS data",
  description:
    "Test your overworld instincts: name the mob, the biome, the block, the tool. " +
    "Live data sourced from the PrismarineJS minecraft-data project.",
  splash: `data:image/svg+xml;utf8,${MC_GRASS_BLOCK_SVG}`,
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
  splash: "https://cdn.metaforge.app/arc-raiders/icons/acoustic-guitar.webp",
  splashAlt: "ARC Raiders item",
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
