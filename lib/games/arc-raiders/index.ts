/**
 * ARC Raiders GameConfig.
 *
 * Categories: Items / Rarity / Type / ARCs / Traders / Value.
 * Live data: MetaForge API (https://metaforge.app/api/arc-raiders/...).
 * Sprites:   MetaForge CDN (cdn.metaforge.app + Supabase) — official in-game icons.
 * Music:     synth fallback for now (no YouTube IDs configured yet).
 */

import type { GameConfig } from "../types";
import {
  ICON_AR_ITEMS, ICON_AR_RARITY, ICON_AR_TYPE,
  ICON_AR_ARCS,  ICON_AR_TRADERS, ICON_AR_VALUE
} from "./icons";
import { buildArcRaidersQuestions } from "./questions";

const CDN = (slug: string) => `https://cdn.metaforge.app/arc-raiders/icons/${slug}.webp`;

export const arcRaidersGame: GameConfig = {
  id: "arc-raiders",
  name: "ARC Raiders",
  tagline: "Surface-side trivia from MetaForge",
  description:
    "Salvage your way through 36 questions about ARC Raiders' items, ARC machines, " +
    "traders, rarities, and resource values. Live data from the MetaForge API — " +
    "every game pulls a fresh randomised set.",
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

  // No YouTube tracks supplied yet — synth fallback
  music: { lobby: null, battle: null, correct: null, winner: null },

  categories: [
    { id: "items",   label: "Items",   icon: ICON_AR_ITEMS,   iconAlt: "Backpack" },
    { id: "rarity",  label: "Rarity",  icon: ICON_AR_RARITY,  iconAlt: "Gem with stars" },
    { id: "type",    label: "Type",    icon: ICON_AR_TYPE,    iconAlt: "Item type grid" },
    { id: "arcs",    label: "ARCs",    icon: ICON_AR_ARCS,    iconAlt: "ARC robot" },
    { id: "traders", label: "Traders", icon: ICON_AR_TRADERS, iconAlt: "Two trader heads" },
    { id: "value",   label: "Value",   icon: ICON_AR_VALUE,   iconAlt: "Coin stack" }
  ],

  starters: {
    title: "Choose your starting loadout item",
    items: [
      {
        id: "adrenaline-shot",
        name: "Adrenaline Shot",
        image: CDN("adrenaline-shot"),
        badge: "Boost",
        badgeClass: "fire",
        blurb: "Quick-use stim. Trade safety for speed when the situation gets nasty."
      },
      {
        id: "bandage",
        name: "Bandage",
        image: CDN("bandage"),
        badge: "Heal",
        badgeClass: "grass",
        blurb: "Patch yourself up between fights. The Raider's best friend."
      },
      {
        id: "barricade-kit",
        name: "Barricade Kit",
        image: CDN("barricade-kit"),
        badge: "Defend",
        badgeClass: "water",
        blurb: "Deployable cover. Hide, recover, ambush. Repeat."
      }
    ]
  },

  buildQuestions: buildArcRaidersQuestions
};
