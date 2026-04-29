/**
 * Inline SVG icons for the ARC Raiders category headers.
 * Drawn in the same chunky black-stroke style as the Pokémon and Minecraft
 * icons so they sit naturally on the gold board headers.
 */

const SVG_ITEMS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <path d='M14 18 L50 18 L48 56 L16 56 Z' fill='#a8682c' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <path d='M22 18 L22 12 a10 10 0 0 1 20 0 L42 18' fill='none' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='20' y='30' width='24' height='4' fill='#7c4f24'/>
  <rect x='20' y='40' width='24' height='4' fill='#7c4f24'/>
  <circle cx='44' cy='32' r='3' fill='#7ec3ff' stroke='#1b1b1b' stroke-width='1.5'/>
</svg>`;

const SVG_RARITY = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <polygon points='32,6 44,22 38,46 26,46 20,22' fill='#7ec3ff' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <polygon points='32,6 44,22 32,28 20,22' fill='#a8e0ff'/>
  <polygon points='14,52 18,46 22,52 18,58' fill='#ffd700' stroke='#1b1b1b' stroke-width='1.5'/>
  <polygon points='42,52 46,46 50,52 46,58' fill='#ffd700' stroke='#1b1b1b' stroke-width='1.5'/>
  <polygon points='28,52 32,48 36,52 32,56' fill='#ffd700' stroke='#1b1b1b' stroke-width='1.5'/>
</svg>`;

const SVG_TYPE = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' shape-rendering='crispEdges'>
  <rect x='6' y='6'  width='22' height='22' fill='#d4a14a' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='36' y='6' width='22' height='22' fill='#7ec3ff' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='6' y='36' width='22' height='22' fill='#9b6bd9' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='36' y='36' width='22' height='22' fill='#5cb85c' stroke='#1b1b1b' stroke-width='2.5'/>
</svg>`;

const SVG_ARCS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' shape-rendering='crispEdges'>
  <rect x='14' y='14' width='36' height='28' fill='#7e8a99' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='14' y='14' width='36' height='6' fill='#5b6573'/>
  <rect x='20' y='22' width='8' height='8' fill='#ee1515' stroke='#1b1b1b' stroke-width='1.5'/>
  <rect x='36' y='22' width='8' height='8' fill='#ee1515' stroke='#1b1b1b' stroke-width='1.5'/>
  <rect x='24' y='34' width='16' height='4' fill='#1b1b1b'/>
  <rect x='8' y='42' width='6' height='14' fill='#7e8a99' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='50' y='42' width='6' height='14' fill='#7e8a99' stroke='#1b1b1b' stroke-width='2.5'/>
  <rect x='18' y='42' width='28' height='4' fill='#5b6573'/>
  <rect x='22' y='46' width='4' height='14' fill='#7e8a99' stroke='#1b1b1b' stroke-width='2'/>
  <rect x='38' y='46' width='4' height='14' fill='#7e8a99' stroke='#1b1b1b' stroke-width='2'/>
</svg>`;

const SVG_TRADERS = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <circle cx='22' cy='22' r='10' fill='#f0c873' stroke='#1b1b1b' stroke-width='2.5'/>
  <path d='M6 56 a16 16 0 0 1 32 0 Z' fill='#a87830' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <circle cx='46' cy='28' r='8' fill='#7ec3ff' stroke='#1b1b1b' stroke-width='2.5'/>
  <path d='M34 56 a14 14 0 0 1 24 0 Z' fill='#4a8fc8' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <line x1='28' y1='38' x2='40' y2='38' stroke='#1b1b1b' stroke-width='2.5' stroke-linecap='round'/>
</svg>`;

const SVG_VALUE = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <ellipse cx='32' cy='14' rx='22' ry='8' fill='#ffd700' stroke='#1b1b1b' stroke-width='2.5'/>
  <path d='M10 14 L10 36 a22 8 0 0 0 44 0 L54 14' fill='#c9a800' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <ellipse cx='32' cy='36' rx='22' ry='8' fill='#ffd700' stroke='#1b1b1b' stroke-width='2.5'/>
  <path d='M10 36 L10 50 a22 8 0 0 0 44 0 L54 36' fill='#c9a800' stroke='#1b1b1b' stroke-width='2.5' stroke-linejoin='round'/>
  <text x='32' y='40' font-family='monospace' font-size='14' font-weight='900' text-anchor='middle' fill='#1b1b1b'>$</text>
</svg>`;

function uri(svg: string) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg.trim());
}

export const ICON_AR_ITEMS   = uri(SVG_ITEMS);
export const ICON_AR_RARITY  = uri(SVG_RARITY);
export const ICON_AR_TYPE    = uri(SVG_TYPE);
export const ICON_AR_ARCS    = uri(SVG_ARCS);
export const ICON_AR_TRADERS = uri(SVG_TRADERS);
export const ICON_AR_VALUE   = uri(SVG_VALUE);
