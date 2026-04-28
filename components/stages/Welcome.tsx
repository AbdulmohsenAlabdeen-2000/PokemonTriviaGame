"use client";

import { audio } from "@/lib/audio";

export default function Welcome({ onStart }: { onStart: () => void }) {
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
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
          alt="Pikachu"
          style={{ width: 120, height: 120, objectFit: "contain", filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.18))" }}
          className="hero-mascot"
        />
        <h1 className="title">Pokémon<br/>Trivia Arena</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
          alt=""
          aria-hidden
          style={{ width: 60, height: 60, objectFit: "contain", imageRendering: "pixelated" }}
        />
      </div>
      <p className="subtitle" style={{ maxWidth: 640, margin: "8px auto 24px" }}>
        Two trainers, six categories, thirty-six questions of escalating difficulty.
        One champion. Choose your name, pick your starter, and battle through
        Pokémon, Types, Gyms, Characters, Poké Balls and Colors.
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
