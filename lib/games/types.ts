/**
 * Shared types used by every game in the trivia app.
 *
 * Each game is plugged in as a GameConfig (see lib/games/registry.ts).
 * A GameConfig owns its own categories, theme colours, music, starter
 * loadouts, and question generator — the rest of the app (game flow,
 * board, scoring, audio, persistence) is game-agnostic.
 */

export type Difficulty = "easy" | "medium" | "hard";

export const POINTS_FOR: Record<Difficulty, 200 | 400 | 600> = {
  easy: 200, medium: 400, hard: 600
};

/** Penalty applied when a player answers a HARD question wrong. */
export const HARD_WRONG_PENALTY = -100;

/** Generic question shape used by every game. */
export type Question = {
  id: string;
  /** Must match the id of one of the game's CategoryConfigs. */
  categoryId: string;
  difficulty: Difficulty;
  value: 200 | 400 | 600;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  image: string;
  /**
   * If true, the question's image should NOT be silhouetted on the
   * picker / challenger phases. Defaults to false (silhouette on).
   * Useful for ball-naming questions where the colour IS the cue, or
   * for items where the silhouette would obliterate the answer.
   */
  preventSilhouette?: boolean;
  /**
   * If true, force the silhouette regardless of the per-game default
   * (used for ball *colour* questions where we want a black mystery ball).
   */
  forceSilhouette?: boolean;
};

/** A single column on the board. */
export type CategoryConfig = {
  /** Stable id used in Question.categoryId. */
  id: string;
  label: string;
  icon: string;
  iconAlt: string;
  /**
   * If "pixel", the image is rendered with image-rendering: pixelated.
   * Useful for low-res sprites (PokéAPI items, Minecraft 16x16 textures).
   */
  iconStyle?: "pixel" | "smooth";
};

/** A "starter" loadout the player picks during setup (Pokémon starter, Minecraft tool, etc.). */
export type StarterConfig = {
  id: string;
  name: string;
  image: string;
  badge: string;        // short tag like "Grass", "Iron", "Pistol"
  badgeClass: string;   // CSS class for the badge background
  blurb: string;        // short flavour text
};

/** Theme colours for the entire UI when this game is active. */
export type ThemeConfig = {
  /** Tagging used on `<body data-game="...">` for CSS scoping. */
  bodyAttr: string;
  /** Six colour overrides applied via CSS custom properties. */
  primary:  string;
  primaryDark: string;
  accent:   string;
  accentDark: string;
  blue:     string;
  /** Background gradient used on the page shell. */
  bgGradient: string;
};

/** Per-game music — YouTube video IDs (or null to fall back to synth). */
export type MusicConfig = {
  lobby:   string | null;
  battle:  string | null;
  correct: string | null;
  winner:  string | null;
};

/**
 * The small icon shown next to the point value on each board tile.
 * Lets each game brand its own tiles (Pokémon uses Poké/Great/Ultra
 * balls, Minecraft uses Wood/Iron/Diamond pickaxes, ARC Raiders uses
 * common/rare/legendary item rarity gems, etc.).
 */
export type TileIcons = {
  easy: string;
  medium: string;
  hard: string;
  /** "pixel" applies image-rendering: pixelated for low-res sprites. */
  iconStyle?: "pixel" | "smooth";
};

/** Top-level game config. */
export type GameConfig = {
  id: string;
  name: string;
  /** Short subtitle shown on the game-select card. */
  tagline: string;
  /** Long-form description shown on hover / when selected. */
  description: string;
  /** Splash image for the game-select card. */
  splash: string;
  splashAlt: string;
  theme: ThemeConfig;
  music: MusicConfig;
  categories: CategoryConfig[];
  /** Icons shown next to point values on the board, one per difficulty. */
  tileIcons: TileIcons;
  starters: {
    title: string;        // e.g. "Choose your starter Pokémon"
    items: StarterConfig[];
  };
  /**
   * Async question builder. Must return exactly 6 questions per category
   * (2 easy, 2 medium, 2 hard). Called once at the start of a game.
   */
  buildQuestions: () => Promise<Question[]>;
};

/** Serialisable player profile (name + chosen starter id + game id). */
export type PlayerProfile = {
  name: string;
  starterId: string;
};
