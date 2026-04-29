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
import { arcRaidersGame } from "./arc-raiders";
import { cs2Game } from "./cs2";

export type GameEntry = {
  config: GameConfig;
  playable: boolean;
};

export const GAMES: GameEntry[] = [
  { config: pokemonGame,    playable: true },
  { config: minecraftGame,  playable: true },
  { config: arcRaidersGame, playable: true },
  { config: cs2Game,        playable: true }
];

export function gameById(id: string): GameConfig | null {
  return GAMES.find((g) => g.config.id === id)?.config ?? null;
}
