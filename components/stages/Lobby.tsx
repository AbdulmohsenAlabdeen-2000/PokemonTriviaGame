"use client";

import { useEffect } from "react";
import { audio } from "@/lib/audio";
import type { GameConfig, StarterConfig } from "@/lib/games/types";
import type { SetupResult } from "@/components/stages/Setup";

function findStarter(game: GameConfig, id: string): StarterConfig | undefined {
  return game.starters.items.find((s) => s.id === id);
}

export default function Lobby({
  game,
  setup,
  onBegin
}: {
  game: GameConfig;
  setup: SetupResult;
  onBegin: () => void;
}) {
  useEffect(() => { audio().playLobby(); }, []);

  const p1 = findStarter(game, setup.p1.starterId);
  const p2 = findStarter(game, setup.p2.starterId);
  if (!p1 || !p2) return null;

  return (
    <section className="card stage">
      <h1 className="title">Pre-Battle Lobby</h1>
      <p className="subtitle" style={{ marginBottom: 8 }}>Both players have arrived. Time to battle!</p>
      <div className="vs-grid">
        <div className="vs-player" data-side="p1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p1.image} alt={p1.name} />
          <div className="pname" style={{ color: "var(--color-poke-red)" }}>{setup.p1.name}</div>
          <div className="ppoke">{p1.name}</div>
          <span className={`type-badge ${p1.badgeClass}`}>{p1.badge}</span>
        </div>
        <div className="vs-divider">VS</div>
        <div className="vs-player" data-side="p2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p2.image} alt={p2.name} />
          <div className="pname" style={{ color: "var(--color-poke-blue)" }}>{setup.p2.name}</div>
          <div className="ppoke">{p2.name}</div>
          <span className={`type-badge ${p2.badgeClass}`}>{p2.badge}</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="float-btn primary"
          onClick={() => {
            audio().playFanfare();
            onBegin();
          }}
        >
          Begin Battle
          <span aria-hidden="true" style={{ fontSize: 22 }}>›</span>
        </button>
      </div>
    </section>
  );
}
