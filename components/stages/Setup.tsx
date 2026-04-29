"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import type { GameConfig } from "@/lib/games/types";

export type SetupResult = {
  p1: { name: string; starterId: string };
  p2: { name: string; starterId: string };
};

type SubPhase = "p1-name" | "p1-poke" | "p2-name" | "p2-poke";

export default function Setup({
  game,
  onDone
}: {
  game: GameConfig;
  onDone: (r: SetupResult) => void;
}) {
  const [phase, setPhase] = useState<SubPhase>("p1-name");
  const [p1Name, setP1Name] = useState("");
  const [p2Name, setP2Name] = useState("");
  const [p1Star, setP1Star] = useState<string | null>(null);
  const [p2Star, setP2Star] = useState<string | null>(null);

  useEffect(() => { audio().playWhoosh(); }, [phase]);

  const validName = (n: string) => n.trim().length >= 2 && n.trim().length <= 20;

  if (phase === "p1-name" || phase === "p2-name") {
    const isP1 = phase === "p1-name";
    const value = isP1 ? p1Name : p2Name;
    const setValue = isP1 ? setP1Name : setP2Name;
    const accent = isP1 ? "var(--color-poke-red)" : "var(--color-poke-blue)";
    return (
      <section className="card stage" style={{ maxWidth: 640 }}>
        <p className="subtitle" style={{ marginTop: 6 }}>Step {isP1 ? 1 : 3} of 4</p>
        <h1 className="title" style={{ marginBottom: 8 }}>
          <span style={{ color: accent }}>{isP1 ? "Player 1" : "Player 2"}</span>
        </h1>
        <p className="subtitle" style={{ marginBottom: 20 }}>Enter your name</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            autoFocus
            className="trainer-input"
            placeholder="Enter your name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && validName(value)) {
                audio().playClick();
                setPhase(isP1 ? "p1-poke" : "p2-poke");
              }
            }}
            maxLength={20}
            style={{
              width: "100%", maxWidth: 460,
              padding: "16px 20px",
              border: "3px solid var(--color-poke-ink)",
              borderRadius: 18,
              background: "white",
              fontSize: 20, fontWeight: 700,
              boxShadow: `0 0 0 3px ${accent}33, 0 6px 0 var(--color-poke-ink)`,
              textAlign: "center"
            }}
          />
        </div>
        <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginTop: 10 }}>
          {value.trim().length}/20 — minimum 2 characters
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
          <button
            className="float-btn primary"
            disabled={!validName(value)}
            aria-disabled={!validName(value)}
            onClick={() => {
              audio().playClick();
              setPhase(isP1 ? "p1-poke" : "p2-poke");
            }}
          >
            Next
            <span aria-hidden="true" style={{ fontSize: 22 }}>›</span>
          </button>
        </div>
      </section>
    );
  }

  // Starter / loadout picker (game-driven)
  const isP1 = phase === "p1-poke";
  const star = isP1 ? p1Star : p2Star;
  const setStar = isP1 ? setP1Star : setP2Star;
  const name = isP1 ? p1Name : p2Name;
  const accent = isP1 ? "var(--color-poke-red)" : "var(--color-poke-blue)";

  const proceed = () => {
    if (!star) return;
    audio().playClick();
    if (isP1) {
      setPhase("p2-name");
    } else {
      onDone({
        p1: { name: p1Name.trim(), starterId: p1Star! },
        p2: { name: p2Name.trim(), starterId: star }
      });
    }
  };

  return (
    <section className="card stage">
      <p className="subtitle" style={{ marginTop: 6 }}>Step {isP1 ? 2 : 4} of 4</p>
      <h1 className="title" style={{ marginBottom: 8 }}>
        <span style={{ color: accent }}>{name}</span>
      </h1>
      <p className="subtitle" style={{ marginBottom: 16 }}>{game.starters.title}</p>
      <div className="starter-grid">
        {game.starters.items.map((s) => (
          <button
            key={s.id}
            type="button"
            className="starter"
            data-selected={star === s.id}
            onClick={() => {
              audio().playClick();
              setStar(s.id);
            }}
            onMouseEnter={() => audio().playHover()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt={s.name} />
            <h3>{s.name}</h3>
            <span className={`type-badge ${s.badgeClass}`}>{s.badge}</span>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{s.blurb}</p>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="float-btn primary"
          disabled={!star}
          aria-disabled={!star}
          onClick={proceed}
        >
          {isP1 ? "Next Player" : "To the Lobby"}
          <span aria-hidden="true" style={{ fontSize: 22 }}>›</span>
        </button>
      </div>
    </section>
  );
}
