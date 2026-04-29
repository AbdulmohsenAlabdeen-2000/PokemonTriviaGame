/**
 * Real Counter-Strike 2 image URLs used as category icons on the board
 * headers. Every entry is a Steam Community CDN URL pulled from the
 * ByMykel/CSGO-API JSON — actual in-game inventory artwork.
 *
 * Mapping rationale:
 *   - Weapons   → AK-47 default skin (most iconic CS rifle)
 *   - Knives    → ★ Karambit | Fade (the fan-favourite knife skin)
 *   - Rarity    → AWP | Dragon Lore (the legendary Covert benchmark)
 *   - Stickers  → Sticker | Howling Dawn (the rarest/most famous sticker)
 *   - Items     → Operation Bravo Case (the classic CS2 weapon case)
 *
 * Maps don't have a public CS2 icon endpoint — we use the official
 * Counter-Strike 2 game logo via Wikimedia for that header.
 */

export const ICON_CS_WEAPONS  =
  "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSIeOaB2qf19F6ueZhW2e2wEt-t2jcytf6dymSO1JxA5oiRecLsRa5kIfkYr-241aLgotHz3-rkGoXuUp8oX57";
// Karambit | Fade (Covert tier, the most recognisable knife skin)
export const ICON_CS_KNIVES   =
  "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8";
// AWP | Dragon Lore — the iconic Covert (red) rarity benchmark
export const ICON_CS_RARITY   =
  "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV";
// Sticker | Howling Dawn — the famous Contraband sticker
export const ICON_CS_STICKERS =
  "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJai0ki7VeTHjMmuOHaC619h7delpVHoVhH4kJHf-SNM4bz9bKY_dPWQWDCUkLxy57g_H3DgkB5w42uAzIv4I3meOAQlApdwFO5YrFDmxUNp_lL7";
// CS2 cover art via Wikimedia (no public API for in-game map icons)
export const ICON_CS_MAPS     =
  "https://en.wikipedia.org/wiki/Special:FilePath/CS2_Cover_Art.jpg";
// Operation Bravo Case — the original Covert-tier weapon case
export const ICON_CS_ITEMS    =
  "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj7-lz1QAn4kZjf9CsVuvf7OfQ5IabBVzbHlb915bcwHCjikEp_sTnTn4z6eH6RblQlC8RwFPlK7EdXSP0Ibg";

// Used by the cursor — Butterfly Knife | Gamma Doppler (Emerald phase look)
export const CS_BUTTERFLY_EMERALD =
  "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsD2qvxONzouBlSxa-lA8lvziMgIr9HifOOV5kFJp2Ee9b4Rntm4GxY7_ntQHc2o1DmH6r3Hgcv3w4t-pXU6ZzrPHQjQnfcepq0dwfRJw";
