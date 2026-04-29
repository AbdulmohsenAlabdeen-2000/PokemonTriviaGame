/**
 * Inline SVG icons for the Minecraft category headers.
 *
 * Wiki sprites work for items/blocks/mobs but not for the abstract
 * categories (Items / Mobs / Biomes / Tools / Blocks / Crafting), so we
 * draw them in SVG and embed as data: URIs — same pattern as Pokemon.
 */

const SVG_BLOCKS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' shape-rendering='crispEdges'>
  <polygon points='32,4 60,18 32,32 4,18' fill='#7bba47' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <polygon points='4,18 32,32 32,60 4,46' fill='#8b5a2b' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <polygon points='32,32 60,18 60,46 32,60' fill='#a06b35' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
</svg>`;

const SVG_MOBS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' shape-rendering='crispEdges'>
  <rect x='14' y='10' width='36' height='32' fill='#5cb85c' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='14' y='42' width='10' height='14' fill='#5cb85c' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='40' y='42' width='10' height='14' fill='#5cb85c' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='20' y='18' width='6' height='6' fill='#1b1b1b'/>
  <rect x='38' y='18' width='6' height='6' fill='#1b1b1b'/>
  <rect x='28' y='28' width='4' height='4' fill='#1b1b1b'/>
  <rect x='32' y='28' width='4' height='4' fill='#1b1b1b'/>
  <rect x='28' y='32' width='8' height='4' fill='#1b1b1b'/>
  <rect x='24' y='28' width='4' height='4' fill='#1b1b1b'/>
  <rect x='36' y='28' width='4' height='4' fill='#1b1b1b'/>
</svg>`;

const SVG_BIOMES = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <path d='M4 56 L4 36 L20 22 L32 32 L46 18 L60 36 L60 56 Z' fill='#5b8a3a' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <circle cx='48' cy='14' r='6' fill='#ffd35a' stroke='#1b1b1b' stroke-width='2'/>
  <path d='M14 56 L14 44 L20 38 L26 44 L26 56 Z' fill='#3e6028' stroke='#1b1b1b' stroke-width='2'/>
  <path d='M40 56 L40 48 L46 42 L52 48 L52 56 Z' fill='#3e6028' stroke='#1b1b1b' stroke-width='2'/>
  <rect x='4' y='52' width='56' height='4' fill='#7bba47'/>
</svg>`;

const SVG_TOOLS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' shape-rendering='crispEdges'>
  <rect x='28' y='8' width='4' height='32' fill='#8b5a2b' stroke='#1b1b1b' stroke-width='2'/>
  <path d='M14 12 L36 12 L42 24 L36 30 L18 30 L14 24 Z' fill='#9e9e9e' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <rect x='34' y='32' width='4' height='6' fill='#8b5a2b' stroke='#1b1b1b' stroke-width='2'/>
  <path d='M28 38 L48 56 L56 50 L36 32 Z' fill='#a8a8a8' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
</svg>`;

const SVG_ITEMS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <path d='M14 22 L50 22 L46 56 L18 56 Z' fill='#a8682c' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <path d='M22 22 L22 14 a10 10 0 0 1 20 0 L42 22' fill='none' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='28' y='30' width='8' height='14' fill='#5dc7e3'/>
  <rect x='28' y='30' width='8' height='14' fill='none' stroke='#1b1b1b' stroke-width='1.5'/>
</svg>`;

const SVG_CRAFTING = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' shape-rendering='crispEdges'>
  <rect x='6' y='10' width='52' height='44' fill='#a8682c' stroke='#1b1b1b' stroke-width='2.5'/>
  <line x1='24' y1='10' x2='24' y2='54' stroke='#1b1b1b' stroke-width='2'/>
  <line x1='40' y1='10' x2='40' y2='54' stroke='#1b1b1b' stroke-width='2'/>
  <line x1='6' y1='25' x2='58' y2='25' stroke='#1b1b1b' stroke-width='2'/>
  <line x1='6' y1='40' x2='58' y2='40' stroke='#1b1b1b' stroke-width='2'/>
  <rect x='10' y='14' width='10' height='8' fill='#7bba47'/>
  <rect x='44' y='28' width='10' height='8' fill='#9e9e9e'/>
  <rect x='28' y='44' width='8' height='6' fill='#8b5a2b'/>
</svg>`;

function uri(svg: string) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg.trim());
}

export const ICON_MC_BLOCKS    = uri(SVG_BLOCKS);
export const ICON_MC_MOBS      = uri(SVG_MOBS);
export const ICON_MC_BIOMES    = uri(SVG_BIOMES);
export const ICON_MC_TOOLS     = uri(SVG_TOOLS);
export const ICON_MC_ITEMS     = uri(SVG_ITEMS);
export const ICON_MC_CRAFTING  = uri(SVG_CRAFTING);
