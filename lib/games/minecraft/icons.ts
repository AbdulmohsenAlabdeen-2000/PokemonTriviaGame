/**
 * Real Minecraft Wiki PNG URLs used as category icons on the board headers.
 * Every entry is served by minecraft.wiki's Special:FilePath endpoint —
 * hot-link-friendly and verified by hand.
 */

const WIKI = (file: string) => `https://minecraft.wiki/Special:FilePath/${file}`;

export const ICON_MC_BLOCKS    = WIKI("Grass_Block_JE7_BE6.png"); // iconic isometric grass block
export const ICON_MC_MOBS      = WIKI("Creeper.png");              // Creeper face
export const ICON_MC_BIOMES    = WIKI("Plains.png");               // biome screenshot
export const ICON_MC_ITEMS     = WIKI("Bucket.png");               // bucket (universal item icon)
export const ICON_MC_TOOLS     = WIKI("Iron_Pickaxe.png");         // tool icon
export const ICON_MC_CRAFTING  = WIKI("Crafting_Table.png");       // crafting grid
