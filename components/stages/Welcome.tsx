"use client";

import { audio } from "@/lib/audio";
import type { GameConfig } from "@/lib/games/types";

export default function Welcome({
  game,
  onStart
}: {
  game: GameConfig;
  onStart: () => void;
}) {
  const handleStart = async () => {
    // First-click gesture unlocks the AudioContext for the rest of the session
    await audio().resume();
    audio().playFanfare();
    onStart();
  };

  return (
    <section className="card stage" style={{ textAlign: "center" }}>
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: 18, flexWrap: "wrap", marginBottom: 6
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.splash}
          alt={game.splashAlt}
          style={{ width: 120, height: 120, objectFit: "contain", filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.18))" }}
          className="hero-mascot"
        />
        <h1 className="title">{game.name}<br/>Trivia Arena</h1>
      </div>
      <p className="subtitle" style={{ maxWidth: 640, margin: "8px auto 24px" }}>
        {game.description}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <button className="float-btn primary" onClick={handleStart}>
          Start Your Adventure
          <span aria-hidden="true" style={{ fontSize: 22 }}>›</span>
        </button>
      </div>
      <p style={{ marginTop: 22, color: "#777", fontSize: 13 }}>
        Tip — click the <strong>Sound On / Off</strong> toggle in the bottom-right at any time.
      </p>
    </section>
  );
}
