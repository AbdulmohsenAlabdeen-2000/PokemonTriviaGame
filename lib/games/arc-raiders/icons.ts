/**
 * Real ARC Raiders icon URLs used as category icons on the board headers.
 * Every entry is served by the MetaForge CDN (cdn.metaforge.app or the
 * official Supabase storage bucket they back it with) — same images the
 * game's UI uses.
 */

const META = (slug: string) =>
  `https://cdn.metaforge.app/arc-raiders/icons/${slug}.webp`;
const SUPABASE = (slug: string) =>
  `https://unhbvkszwhczbjxgetgk.supabase.co/storage/v1/object/public/images/arc-raiders/icons/${slug}.webp`;

export const ICON_AR_ITEMS   = META("bandage");                   // healing item — instantly readable
export const ICON_AR_RARITY  = META("advanced-arc-powercell");    // legendary-tier ARC tech
export const ICON_AR_TYPE    = META("complex-gun-parts");         // refined material crate
export const ICON_AR_ARCS    = SUPABASE("bastion");               // iconic heavy ARC enemy
export const ICON_AR_TRADERS = META("blue-light-stick");          // trader-stocked utility item
export const ICON_AR_VALUE   = META("acoustic-guitar");           // legendary 7,000-credit trinket
