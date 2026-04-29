/**
 * Minecraft GameConfig.
 *
 * Categories: Blocks / Mobs / Biomes / Items / Tools / Crafting.
 * Live data: PrismarineJS minecraft-data (raw GitHub JSON, no API key).
 * Sprites:   minecraft.wiki Special:FilePath (hot-link friendly PNGs).
 * Music:     synth fallback for now (no YouTube IDs configured yet).
 */

import type { GameConfig } from "../types";
import {
  ICON_MC_BLOCKS, ICON_MC_MOBS, ICON_MC_BIOMES,
  ICON_MC_ITEMS,  ICON_MC_TOOLS, ICON_MC_CRAFTING
} from "./icons";
import { buildMinecraftQuestions } from "./questions";

const WIKI = (filename: string) =>
  `https://minecraft.wiki/Special:FilePath/${filename}`;

export const minecraftGame: GameConfig = {
  id: "minecraft",
  name: "Minecraft",
  tagline: "Blocky trivia from PrismarineJS data",
  description:
    "Test your overworld instincts: name the block, sort hostile from passive mobs, " +
    "place biomes in their dimension, recall stack sizes, identify tool tiers, and " +
    "remember your recipes. Live data from the PrismarineJS minecraft-data project.",
  splash: WIKI("Grass_Block_JE7_BE6.png"),
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

  // No YouTube tracks supplied — audio manager falls back to synth music
  music: { lobby: null, battle: null, correct: null, winner: null },

  categories: [
    { id: "blocks",   label: "Blocks",   icon: ICON_MC_BLOCKS,   iconAlt: "Block stack" },
    { id: "mobs",     label: "Mobs",     icon: ICON_MC_MOBS,     iconAlt: "Creeper face" },
    { id: "biomes",   label: "Biomes",   icon: ICON_MC_BIOMES,   iconAlt: "Hills + sun" },
    { id: "items",    label: "Items",    icon: ICON_MC_ITEMS,    iconAlt: "Bucket" },
    { id: "tools",    label: "Tools",    icon: ICON_MC_TOOLS,    iconAlt: "Pickaxe" },
    { id: "crafting", label: "Crafting", icon: ICON_MC_CRAFTING, iconAlt: "Crafting grid" }
  ],

  tileIcons: {
    easy:   WIKI("Wooden_Pickaxe.png"),
    medium: WIKI("Iron_Pickaxe.png"),
    hard:   WIKI("Diamond_Pickaxe.png")
  },

  starters: {
    title: "Choose your starting tool",
    items: [
      {
        id: "iron-sword",
        name: "Iron Sword",
        image: WIKI("Iron_Sword.png"),
        badge: "Combat",
        badgeClass: "fire",
        blurb: "Sharp and reliable — strikes hard across the battle."
      },
      {
        id: "diamond-pickaxe",
        name: "Diamond Pickaxe",
        image: WIKI("Diamond_Pickaxe.png"),
        badge: "Mining",
        badgeClass: "water",
        blurb: "Mines anything, including obsidian. Built for scholars."
      },
      {
        id: "bow",
        name: "Bow",
        image: WIKI("Bow.png"),
        badge: "Ranged",
        badgeClass: "grass",
        blurb: "Steady aim from a safe distance — patient and precise."
      }
    ]
  },

  buildQuestions: buildMinecraftQuestions
};
