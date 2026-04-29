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

  // Shares the Pokémon music kit across all games. Audio manager keys YT
  // iframes by gameId so each game gets its own player instance.
  music: {
    lobby:   "l490gxtJMW4",
    battle:  "PfDhKzpUieA",
    correct: "zhCXcOGhy4c",
    winner:  "nyINomMu61E"
  },

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
        // AK-47 | Redline (Classified) — real Steam CDN URL from ByMykel/CSGO-API
        image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA",
        badge: "T side",
        badgeClass: "fire",
        blurb: "The Terrorist staple — high damage, signature spray pattern."
      },
      {
        id: "m4a4",
        name: "M4A4",
        // M4A4 | Asiimov (Covert) — real Steam CDN URL from ByMykel/CSGO-API
        image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6V6V-Kf2cGFidxOp_pewnTii3w0x_tmTRnt2qdHyWaFAjA5UlQOYI5BO5k9bhZunm41OI34NDnjK-0H3pAWw_Rw",
        badge: "CT side",
        badgeClass: "water",
        blurb: "The CT pick — accurate, fast-firing, no silencer drama."
      },
      {
        id: "awp",
        name: "AWP",
        // AWP | Asiimov (Covert) — real Steam CDN URL from ByMykel/CSGO-API
        image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ",
        badge: "Sniper",
        // Use grass class for green styling (psychic isn't defined in CSS)
        badgeClass: "grass",
        blurb: "One shot, one kill. The most iconic CS rifle in existence."
      }
    ]
  },

  buildQuestions: buildCS2Questions
};
