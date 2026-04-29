/**
 * Real Pokémon sprite URLs used as category icons on the board headers.
 * Every entry is an actual PokeAPI official-artwork sprite — no SVG drawings.
 *
 * Mapping rationale:
 *   - Types       → Eevee     (the type-changing icon thanks to eeveelutions)
 *   - Evolutions  → Magikarp  (the most iconic single-evolution moment)
 *   - Pokédex     → Mew       (mythical, completes the Gen-1 dex)
 *   - Colors      → Bulbasaur (vivid green/teal palette)
 */

const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const ICON_TYPES     = ART(133); // Eevee
export const ICON_EVOLUTION = ART(129); // Magikarp
export const ICON_POKEDEX   = ART(151); // Mew
export const ICON_COLORS    = ART(1);   // Bulbasaur
