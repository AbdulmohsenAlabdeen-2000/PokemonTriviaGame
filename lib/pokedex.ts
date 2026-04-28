export type StarterId = "bulbasaur" | "charmander" | "squirtle";

export type Starter = {
  id: StarterId;
  dexId: number;
  name: string;
  type: "Grass" | "Fire" | "Water";
  typeClass: "grass" | "fire" | "water";
  blurb: string;
};

export const STARTERS: Starter[] = [
  {
    id: "bulbasaur",
    dexId: 1,
    name: "Bulbasaur",
    type: "Grass",
    typeClass: "grass",
    blurb: "Calm and dependable. Soaks up XP like sunlight."
  },
  {
    id: "charmander",
    dexId: 4,
    name: "Charmander",
    type: "Fire",
    typeClass: "fire",
    blurb: "Fiery and bold. Burns through tough questions."
  },
  {
    id: "squirtle",
    dexId: 7,
    name: "Squirtle",
    type: "Water",
    typeClass: "water",
    blurb: "Cool under pressure. Splashes through with style."
  }
];

export function spriteFor(dexId: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`;
}

export function starterById(id: StarterId): Starter {
  return STARTERS.find((s) => s.id === id)!;
}
