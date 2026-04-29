"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import { GAMES } from "@/lib/games/registry";

/**
 * Welcome screen — shows a card per game and lets the players pick one.
 * The chosen game's GameConfig is then threaded through every later stage.
 */
export default function GameSelect({
  onSelect
}: {
  onSelect: (gameId: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => { audio().playWelcome(); }, []);

  const choose = async (gameId: string) => {
    await audio().resume();
    audio().playFanfare();
    onSelect(gameId);
  };

  return (
    <section className="card stage" style={{ textAlign: "center", maxWidth: 1100 }}>
      <h1 className="title">Trivia Arena</h1>
      <p className="subtitle" style={{ maxWidth: 640, margin: "8px auto 28px" }}>
        Pick a universe. Two players, six categories, thirty-six questions.
        Each game has its own theme, music, and live data feed.
      </p>

      <div className="game-grid" role="list">
        {GAMES.map(({ config, playable }) => {
          const isHovered = hovered === config.id;
          return (
            <button
              key={config.id}
              type="button"
              className="game-card"
              role="listitem"
              data-game={config.id}
              data-playable={playable}
              data-hovered={isHovered}
              disabled={!playable}
              onMouseEnter={() => { if (playable) { setHovered(config.id); audio().playHover(); } }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => playable && choose(config.id)}
              style={{
                ["--game-primary" as string]:    config.theme.primary,
                ["--game-primary-dark" as string]: config.theme.primaryDark,
                ["--game-accent" as string]:     config.theme.accent
              }}
            >
              {!playable && <span className="coming-soon-pill">Coming soon</span>}
              <div className="game-card-art">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.splash} alt={config.splashAlt} />
              </div>
              <h2 className="game-card-name">{config.name}</h2>
              <p className="game-card-tagline">{config.tagline}</p>
              {playable && <span className="game-card-cta">Play ›</span>}
            </button>
          );
        })}
      </div>

      <p style={{ marginTop: 24, color: "#888", fontSize: 13 }}>
        Tip — your choice unlocks the audio. Sound toggle stays in the bottom-right.
      </p>
    </section>
  );
}
