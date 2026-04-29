/**
 * Backwards-compatibility shim.
 *
 * The trivia app now supports multiple games — see lib/games/registry.ts
 * and lib/games/types.ts for the new architecture. This file exists so
 * older imports keep working during the transition; new code should
 * import directly from "@/lib/games/types".
 */

export type { Question, Difficulty, CategoryConfig, StarterConfig, PlayerProfile } from "./games/types";
export { POINTS_FOR, HARD_WRONG_PENALTY } from "./games/types";
