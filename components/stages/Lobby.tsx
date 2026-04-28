"use client";

import { useEffect } from "react";
import { audio } from "@/lib/audio";
import { spriteFor, starterById } from "@/lib/pokedex";
import type { SetupResult } from "@/components/stages/Setup";

export default function Lobby({
  setup,
  onBegin
}: {
  setup: SetupResult;
  onBegin: () => void;
}) {
  useEffect(() => { audio().playLobby(); }, []);

  const p1 = starterById(setup.p1.starter);
  const p2 = starterById(setup.p2.starter);

  return (
    <section className="card stage">
      <h1 className="title">Pre-Battle Lobby</h1>
      <p className="subtitle" style={{ marginBottom: 8 }}>Both trainers have arrived. Time to battle!</p>
      <div className="vs-grid">
        <div className="vs-player" data-side="p1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spriteFor(p1.dexId)} alt={p1.name} />
          <div className="pname" style={{ color: "var(--color-poke-red)" }}>{setup.p1.name}</div>
          <div className="ppoke">{p1.name}</div>
          <span className={`type-badge ${p1.typeClass}`}>{p1.type}</span>
        </div>
        <div className="vs-divider">VS</div>
        <div className="vs-player" data-side="p2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spriteFor(p2.dexId)} alt={p2.name} />
          <div className="pname" style={{ color: "var(--color-poke-blue)" }}>{setup.p2.name}</div>
          <div className="ppoke">{p2.name}</div>
          <span className={`type-badge ${p2.typeClass}`}>{p2.type}</span>
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
