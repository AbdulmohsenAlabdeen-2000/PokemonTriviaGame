export type Category =
  | "Pokemon"
  | "Types"
  | "Gyms"
  | "Characters"
  | "PokeBalls"
  | "Colors";

export type Difficulty = "easy" | "medium" | "hard";

export const POINTS_FOR: Record<Difficulty, 200 | 400 | 600> = {
  easy: 200, medium: 400, hard: 600
};

/** Penalty applied when the player answers a HARD question wrong (per spec). */
export const HARD_WRONG_PENALTY = -100;

export type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  value: 200 | 400 | 600;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  image: string;
};

const POKE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const ITEM = (slug: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;

export const CATEGORIES: {
  id: Category;
  label: string;
  icon: string;
  iconAlt: string;
  /** Pokedex id whose cry is played when this category's block begins */
  cryId: number;
}[] = [
  { id: "Pokemon",    label: "Pokémon",    icon: POKE(25),  iconAlt: "Pikachu",  cryId: 25  },
  { id: "Types",      label: "Types",      icon: POKE(133), iconAlt: "Eevee",    cryId: 133 },
  { id: "Gyms",       label: "Gyms",       icon: POKE(95),  iconAlt: "Onix",     cryId: 95  },
  { id: "Characters", label: "Characters", icon: POKE(52),  iconAlt: "Meowth",   cryId: 52  },
  { id: "PokeBalls",  label: "Poké Balls", icon: ITEM("poke-ball"), iconAlt: "Poké Ball", cryId: 7 },
  { id: "Colors",     label: "Colors",     icon: POKE(1),   iconAlt: "Bulbasaur", cryId: 1  }
];

const Q = (
  id: string, category: Category, difficulty: Difficulty,
  prompt: string, options: [string, string, string, string],
  answerIndex: 0 | 1 | 2 | 3, image: string
): Question => ({
  id, category, difficulty, value: POINTS_FOR[difficulty],
  prompt, options, answerIndex, image
});

export const QUESTIONS: Question[] = [
  // ============ Pokemon ============
  Q("p-e1", "Pokemon", "easy",
    "Which Pokémon is number 001 in the National Pokédex?",
    ["Charmander", "Bulbasaur", "Squirtle", "Pikachu"], 1, POKE(1)),
  Q("p-e2", "Pokemon", "easy",
    "Which Pokémon is known as the 'Mouse Pokémon'?",
    ["Rattata", "Sandshrew", "Pikachu", "Marill"], 2, POKE(25)),
  Q("p-m1", "Pokemon", "medium",
    "Which Pokémon evolves from Charmander?",
    ["Charmeleon", "Charizard", "Magmar", "Vulpix"], 0, POKE(5)),
  Q("p-m2", "Pokemon", "medium",
    "Eevee evolves into which Pokémon when exposed to a Thunder Stone?",
    ["Flareon", "Vaporeon", "Jolteon", "Umbreon"], 2, POKE(135)),
  Q("p-h1", "Pokemon", "hard",
    "Which legendary Pokémon is said to have created the universe in Sinnoh lore?",
    ["Dialga", "Palkia", "Arceus", "Giratina"], 2, POKE(493)),
  Q("p-h2", "Pokemon", "hard",
    "Mewtwo was genetically engineered from the DNA of which Pokémon?",
    ["Mew", "Ditto", "Jirachi", "Celebi"], 0, POKE(150)),

  // ============ Types ============
  Q("t-e1", "Types", "easy",
    "What type is Pikachu?",
    ["Fire", "Electric", "Normal", "Fighting"], 1, POKE(25)),
  Q("t-e2", "Types", "easy",
    "Squirtle is which type?",
    ["Grass", "Fire", "Water", "Ice"], 2, POKE(7)),
  Q("t-m1", "Types", "medium",
    "What is Gengar's type combination?",
    ["Ghost / Poison", "Ghost / Dark", "Dark / Poison", "Pure Ghost"], 0, POKE(94)),
  Q("t-m2", "Types", "medium",
    "Which type is completely immune to Electric attacks?",
    ["Rock", "Ground", "Steel", "Flying"], 1, POKE(27)),
  Q("t-h1", "Types", "hard",
    "Fairy-type moves are super effective against which type?",
    ["Steel", "Dragon", "Fire", "Psychic"], 1, POKE(700)),
  Q("t-h2", "Types", "hard",
    "Bug-type moves are super effective against all of these EXCEPT:",
    ["Psychic", "Grass", "Dark", "Fighting"], 3, POKE(12)),

  // ============ Gyms ============
  Q("g-e1", "Gyms", "easy",
    "Who is the Gym Leader of Pewter City?",
    ["Misty", "Brock", "Lt. Surge", "Erika"], 1, POKE(95)),
  Q("g-e2", "Gyms", "easy",
    "Misty, the Cerulean Gym Leader, specializes in which type?",
    ["Ice", "Water", "Electric", "Grass"], 1, POKE(121)),
  Q("g-m1", "Gyms", "medium",
    "Which Kanto Gym Leader awards the Thunder Badge?",
    ["Lt. Surge", "Sabrina", "Blaine", "Giovanni"], 0, POKE(26)),
  Q("g-m2", "Gyms", "medium",
    "Erika of Celadon City specializes in which type?",
    ["Bug", "Grass", "Poison", "Fairy"], 1, POKE(45)),
  Q("g-h1", "Gyms", "hard",
    "Sabrina, the Saffron City Gym Leader, uses which type?",
    ["Ghost", "Psychic", "Dark", "Fairy"], 1, POKE(65)),
  Q("g-h2", "Gyms", "hard",
    "Team Rocket boss Giovanni is the leader of which Kanto Gym?",
    ["Cinnabar", "Vermilion", "Viridian", "Fuchsia"], 2, POKE(34)),

  // ============ Characters ============
  Q("c-e1", "Characters", "easy",
    "What is Ash Ketchum's hometown?",
    ["Viridian City", "Pallet Town", "Cerulean City", "Pewter City"], 1, POKE(25)),
  Q("c-e2", "Characters", "easy",
    "Professor Oak is the regional professor of which region?",
    ["Johto", "Hoenn", "Kanto", "Sinnoh"], 2, POKE(16)),
  Q("c-m1", "Characters", "medium",
    "Who is Ash's longtime rival from Pallet Town?",
    ["Paul", "Trip", "Gary Oak", "Ritchie"], 2, POKE(133)),
  Q("c-m2", "Characters", "medium",
    "Which Team Rocket trio always tries to steal Pikachu?",
    ["Jessie, James, Meowth", "Cassidy, Butch, Raticate", "Annie, Oakley, Espeon", "Archer, Ariana, Houndoom"], 0, POKE(52)),
  Q("c-h1", "Characters", "hard",
    "Who is the Champion of the Indigo League at the end of Pokémon Red & Blue?",
    ["Lance", "Blue / Gary", "Steven", "Cynthia"], 1, POKE(9)),
  Q("c-h2", "Characters", "hard",
    "Which character is famous for the catchphrase 'Prepare for trouble'?",
    ["James", "Jessie", "Meowth", "Giovanni"], 1, POKE(202)),

  // ============ PokeBalls ============
  Q("b-e1", "PokeBalls", "easy",
    "What are the two main colors of a standard Poké Ball?",
    ["Red and white", "Blue and white", "Yellow and black", "Red and black"], 0, ITEM("poke-ball")),
  Q("b-e2", "PokeBalls", "easy",
    "The Master Ball has what catch rate?",
    ["1×", "2×", "100% guaranteed", "255×"], 2, ITEM("master-ball")),
  Q("b-m1", "PokeBalls", "medium",
    "Which Poké Ball has the highest catch rate against Water and Bug Pokémon?",
    ["Ultra Ball", "Net Ball", "Dive Ball", "Quick Ball"], 1, ITEM("net-ball")),
  Q("b-m2", "PokeBalls", "medium",
    "The Quick Ball is most effective when used:",
    ["At night", "On the first turn of battle", "Against sleeping Pokémon", "On low-HP Pokémon"], 1, ITEM("quick-ball")),
  Q("b-h1", "PokeBalls", "hard",
    "The Dusk Ball is most effective in which conditions?",
    ["In caves and at night", "Against Ghost types", "On the first turn", "Underwater"], 0, ITEM("dusk-ball")),
  Q("b-h2", "PokeBalls", "hard",
    "Which ball is given out for free when buying ten standard Poké Balls?",
    ["Great Ball", "Premier Ball", "Heal Ball", "Luxury Ball"], 1, ITEM("premier-ball")),

  // ============ Colors ============
  Q("col-e1", "Colors", "easy",
    "What color is Pikachu's body?",
    ["Orange", "Yellow", "Red", "Green"], 1, POKE(25)),
  Q("col-e2", "Colors", "easy",
    "What color is the top half of a standard Poké Ball?",
    ["Blue", "Red", "White", "Yellow"], 1, ITEM("poke-ball")),
  Q("col-m1", "Colors", "medium",
    "What is the dominant color of a Great Ball's top half?",
    ["Red", "Blue", "Yellow", "Black"], 1, ITEM("great-ball")),
  Q("col-m2", "Colors", "medium",
    "What is the primary color of a Master Ball?",
    ["Purple", "Pink", "Black", "Gold"], 0, ITEM("master-ball")),
  Q("col-h1", "Colors", "hard",
    "What colors are the markings on an Ultra Ball's top half?",
    ["Red and white", "Black and yellow", "Blue and white", "Green and gold"], 1, ITEM("ultra-ball")),
  Q("col-h2", "Colors", "hard",
    "Shiny Charizard appears predominantly which color instead of orange?",
    ["Green / black", "Red", "Blue", "Pink"], 0, POKE(6))
];

// ---------- Random helpers ----------
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleAnswers(q: Question): Question {
  const indexed = q.options.map((opt, i) => ({ opt, isAnswer: i === q.answerIndex }));
  const shuffled = shuffle(indexed);
  return {
    ...q,
    options: shuffled.map((x) => x.opt) as [string, string, string, string],
    answerIndex: shuffled.findIndex((x) => x.isAnswer) as 0 | 1 | 2 | 3
  };
}

/**
 * Build the per-game question order:
 * - Shuffle category block order
 * - Within each block, shuffle the 6 questions (mixed difficulty)
 * - Shuffle each question's answer options
 *
 * Returns 36 questions total.
 */
export function buildGameQuestions(): Question[] {
  const blocks = shuffle(CATEGORIES.map((c) => c.id));
  const out: Question[] = [];
  for (const cat of blocks) {
    const inCat = QUESTIONS.filter((q) => q.category === cat);
    const shuffled = shuffle(inCat).map(shuffleAnswers);
    out.push(...shuffled);
  }
  return out;
}

export function categoryMeta(id: Category) {
  return CATEGORIES.find((c) => c.id === id)!;
}
