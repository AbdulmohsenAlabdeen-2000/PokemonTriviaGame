/**
 * Inline SVG icons for the abstract trivia categories.
 *
 * The Pokémon and Poké Balls categories use real PokeAPI sprites (Pikachu and
 * the Poké Ball item respectively), but Evolutions / Types / Pokédex / Colors
 * are concepts — PokeAPI doesn't ship icons for those. So we draw them as
 * compact SVGs sized for the 48×48 board-column header slot, then expose them
 * as data: URIs so the existing <img src=...> render path keeps working.
 *
 * All four icons share the chunky black 2.5px stroke and the saturated palette
 * of the rest of the UI so they sit naturally on the gold category headers.
 */

/** Yellow burst + smaller white sparkles — the Pokémon "evolution flash". */
const SVG_EVOLUTION = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <path d='M32 6 L36 26 L56 30 L36 34 L32 54 L28 34 L8 30 L28 26 Z' fill='#ffd700' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <path d='M50 8 L52 14 L58 16 L52 18 L50 24 L48 18 L42 16 L48 14 Z' fill='#ffffff' stroke='#1b1b1b' stroke-width='2' stroke-linejoin='round'/>
  <path d='M14 44 L16 48 L20 50 L16 52 L14 56 L12 52 L8 50 L12 48 Z' fill='#ffffff' stroke='#1b1b1b' stroke-width='2' stroke-linejoin='round'/>
</svg>`;

/** Six-segment colour wheel with a white centre — visualises type variety. */
const SVG_TYPES = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <g stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'>
    <path d='M32 32 L32 6 L54 18 Z' fill='#ee1515'/>
    <path d='M32 32 L54 18 L54 46 Z' fill='#ffd700'/>
    <path d='M32 32 L54 46 L32 58 Z' fill='#78c850'/>
    <path d='M32 32 L32 58 L10 46 Z' fill='#0096ff'/>
    <path d='M32 32 L10 46 L10 18 Z' fill='#735797'/>
    <path d='M32 32 L10 18 L32 6 Z' fill='#ff6b35'/>
  </g>
  <circle cx='32' cy='32' r='6' fill='#ffffff' stroke='#1b1b1b' stroke-width='2.5'/>
</svg>`;

/** Red Pokédex device with status lights, blue lens, and a green screen. */
const SVG_POKEDEX = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <rect x='6' y='10' width='52' height='44' rx='5' fill='#ee1515' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='6' y='10' width='52' height='10' fill='#b30000' stroke='none' rx='5'/>
  <circle cx='18' cy='22' r='7' fill='#ffffff' stroke='#1b1b1b' stroke-width='2.5'/>
  <circle cx='18' cy='22' r='3.5' fill='#0096ff'/>
  <circle cx='34' cy='20' r='2.5' fill='#ff5252' stroke='#1b1b1b' stroke-width='1.5'/>
  <circle cx='42' cy='20' r='2.5' fill='#ffd700' stroke='#1b1b1b' stroke-width='1.5'/>
  <circle cx='50' cy='20' r='2.5' fill='#6dd16a' stroke='#1b1b1b' stroke-width='1.5'/>
  <rect x='12' y='32' width='40' height='18' rx='2' fill='#222' stroke='#1b1b1b' stroke-width='2'/>
  <rect x='15' y='35' width='34' height='12' rx='1' fill='#6dd16a'/>
  <rect x='17' y='38' width='6' height='1.5' fill='#0a3a0a'/>
  <rect x='17' y='41' width='14' height='1.5' fill='#0a3a0a'/>
  <rect x='17' y='44' width='10' height='1.5' fill='#0a3a0a'/>
</svg>`;

/** Painter's palette with five colour blobs and a thumb hole. */
const SVG_COLORS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <path d='M32 6 C 16 6 4 18 4 32 C 4 46 16 56 28 56 C 32 56 32 51 30 49 C 28 47 28 43 32 43 C 42 43 52 40 56 30 C 60 16 48 6 32 6 Z' fill='#ecd9b1' stroke='#1b1b1b' stroke-width='2.5'/>
  <circle cx='20' cy='20' r='4' fill='#ee1515' stroke='#1b1b1b' stroke-width='1.5'/>
  <circle cx='32' cy='14' r='4' fill='#ffd700' stroke='#1b1b1b' stroke-width='1.5'/>
  <circle cx='44' cy='20' r='4' fill='#0096ff' stroke='#1b1b1b' stroke-width='1.5'/>
  <circle cx='46' cy='32' r='4' fill='#78c850' stroke='#1b1b1b' stroke-width='1.5'/>
  <circle cx='38' cy='40' r='3.5' fill='#735797' stroke='#1b1b1b' stroke-width='1.5'/>
  <circle cx='20' cy='38' r='3.5' fill='#ffffff' stroke='#1b1b1b' stroke-width='1.5'/>
</svg>`;

/** Wrap an inline SVG string into a data: URI so it can be used in img src. */
function dataUri(svg: string): string {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg.trim());
}

export const ICON_EVOLUTION = dataUri(SVG_EVOLUTION);
export const ICON_TYPES     = dataUri(SVG_TYPES);
export const ICON_POKEDEX   = dataUri(SVG_POKEDEX);
export const ICON_COLORS    = dataUri(SVG_COLORS);
