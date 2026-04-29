/**
 * Counter-Strike 2 GameConfig.
 *
 * Categories: Weapons / Knives / Rarity / Stickers / Maps / Items.
 * Live data:  ByMykel/CSGO-API on GitHub raw (no key required).
 * Sprites:    Steam Community CDN (akamai.steamstatic.com) — official
 *             in-game inventory artwork.
 */

import type { GameConfig } from "../types";
import {
  ICON_CS_WEAPONS, ICON_CS_KNIVES,   ICON_CS_RARITY,
  ICON_CS_STICKERS, ICON_CS_MAPS,    ICON_CS_ITEMS
} from "./icons";
import { buildCS2Questions } from "./questions";

export const cs2Game: GameConfig = {
  id: "cs2",
  name: "Counter-Strike 2",
  tagline: "Skin and map trivia from the live ByMykel CS2 API",
  description:
    "Identify the weapon behind the skin, sort rarities from Consumer Grade to Covert, " +
    "name the knife, recognise stickers, recall map callouts, and pick the right case. " +
    "All powered by the ByMykel CSGO-API — every game pulls a fresh randomised set.",
  splash: "https://en.wikipedia.org/wiki/Special:FilePath/CS2_Cover_Art.jpg",
  splashAlt: "Counter-Strike 2 cover art",

  theme: {
    bodyAttr: "cs2",
    primary:    "#de9b35",        // CS2 orange
    primaryDark:"#a06a1f",
    accent:     "#5dd3e0",        // cyan UI accents
    accentDark: "#2c8294",
    blue:       "#2c3e50",
    bgGradient: "linear-gradient(180deg, #1a1f29 0%, #2c3e50 50%, #3a4a5e 100%)"
  },

  // No YouTube tracks supplied — synth fallback
  music: { lobby: null, battle: null, correct: null, winner: null },

  categories: [
    { id: "weapons",  label: "Weapons",  icon: ICON_CS_WEAPONS,  iconAlt: "AK-47 silhouette" },
    { id: "knives",   label: "Knives",   icon: ICON_CS_KNIVES,   iconAlt: "Karambit silhouette" },
    { id: "rarity",   label: "Rarity",   icon: ICON_CS_RARITY,   iconAlt: "Rarity bar" },
    { id: "stickers", label: "Stickers", icon: ICON_CS_STICKERS, iconAlt: "Yellow sticker" },
    { id: "maps",     label: "Maps",     icon: ICON_CS_MAPS,     iconAlt: "Map with markers" },
    { id: "items",    label: "Items",    icon: ICON_CS_ITEMS,    iconAlt: "Weapon case" }
  ],

  // Tile icons climb the rarity ladder — Mil-Spec blue / Covert red /
  // Knife star — themed to each difficulty.
  tileIcons: {
    // small SVG dots so they pop on the orange CS theme
    easy:   "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' fill='%234b69ff' stroke='%231b1b1b' stroke-width='2'/></svg>",
    medium: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' fill='%23d32ce6' stroke='%231b1b1b' stroke-width='2'/></svg>",
    hard:   "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><polygon points='12,2 14.6,9.5 22,9.5 16.2,14.2 18.5,21.5 12,17 5.5,21.5 7.8,14.2 2,9.5 9.4,9.5' fill='%23ffd700' stroke='%231b1b1b' stroke-width='1.5'/></svg>"
  },

  starters: {
    title: "Pick your starting loadout",
    items: [
      {
        id: "ak-47",
        name: "AK-47",
        image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLITdn2xZ_Iszj7WxRdCtkAfl_RY6N2v3J9CXJlRrYV6Hr1ftxOu605S57s_LzCRl6XQk7H_ezBfll1gSObEJq0Pl",
        badge: "T side",
        badgeClass: "fire",
        blurb: "The Terrorist staple — high damage, signature spray pattern."
      },
      {
        id: "m4a4",
        name: "M4A4",
        image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxIWkmCQfXt0YqKBAhgIwttsraxRMSlmAS-rkBoMmH1coCSJlAyMFvX-1G_x-vmm9bhuMyfn3pkpGdyt3aPlhepiQYMMLW8JdbqB3WQ",
        badge: "CT side",
        badgeClass: "water",
        blurb: "The CT pick — accurate, fast-firing, no silencer drama."
      },
      {
        id: "awp",
        name: "AWP",
        image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYTUjGS-Cu1IDMQwhpcA9osbeyR8DwwwG-rktoYTujINPGdgU-MV6Cqlfqx-_om5C4tcjOzncws3Mn4nuJlBe3hQYMMLVJa2-y",
        badge: "Sniper",
        badgeClass: "psychic",
        blurb: "One shot, one kill. The most iconic CS rifle in existence."
      }
    ]
  },

  buildQuestions: buildCS2Questions
};
