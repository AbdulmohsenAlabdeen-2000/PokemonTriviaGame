"use client";

import { audio } from "@/lib/audio";

/**
 * Floating Main Menu button — Poké Ball-styled.
 * Renders an animated half-red/half-white pokeball icon next to a bold
 * "MAIN MENU" label, with the same drop-shadow + "press in" interaction
 * the rest of the UI uses.
 */
export default function MainMenuButton({ onExit }: { onExit: () => void }) {
  const handleClick = () => {
    audio().playClick();
    const ok = window.confirm(
      "Quit the current game and return to the main menu?\nYour progress will be lost."
    );
    if (ok) {
      audio().stopMusic();
      onExit();
    }
  };

  return (
    <button
      type="button"
      className="main-menu-btn"
      onClick={handleClick}
      aria-label="Return to main menu"
    >
      <span className="main-menu-pokeball" aria-hidden="true">
        <span className="mm-pb-top" />
        <span className="mm-pb-bottom" />
        <span className="mm-pb-belt" />
        <span className="mm-pb-button" />
      </span>
      <span className="main-menu-label">Main Menu</span>
    </button>
  );
}
