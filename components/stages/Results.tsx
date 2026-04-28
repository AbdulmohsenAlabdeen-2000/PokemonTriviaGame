"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { audio } from "@/lib/audio";
import { spriteFor } from "@/lib/pokedex";
import type { FinalResult } from "@/components/stages/Play";

const CONFETTI_COLORS = [
  "#ee1515", // red
  "#ffd700", // yellow
  "#0051ba", // blue
  "#6dd16a", // green
  "#ff69b4", // pink
  "#0096ff"  // cyan
];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 3,
        size: 6 + Math.random() * 10,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        round: Math.random() > 0.5,
        spinX: Math.random() > 0.5 ? 1 : -1
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--spin" as string]: `${p.spinX * 720}deg`
          }}
        />
      ))}
    </div>
  );
}

export default function Results({
  result,
  onReplay,
  onHome
}: {
  result: FinalResult;
  onReplay: () => void;
  onHome: () => void;
}) {
  // Play the YT winner music when this stage mounts. Stop it on unmount.
  useEffect(() => {
    audio().playWinnerMusic();
    audio().playFanfare();
    return () => {
      // When leaving Results, stop the winner music so the next stage starts clean.
      audio().stopMusic();
    };
  }, []);

  const tie = result.p1.score === result.p2.score;
  const p1Wins = result.p1.score > result.p2.score;
  const winnerName = tie ? null : p1Wins ? result.p1.name : result.p2.name;
  const winnerScore = tie ? null : p1Wins ? result.p1.score : result.p2.score;
  const loserScore = tie ? null : p1Wins ? result.p2.score : result.p1.score;

  return (
    <>
      {!tie && <Confetti />}
      <section className="card stage results-card-wrap">
        <div className="results-hero">
          {tie ? (
            <>
              <div className="crown">🤝</div>
              <div className="winner-name">It's a Tie!</div>
              <div className="winner-sub">
                Both trainers finished on {result.p1.score.toLocaleString()} pts.
              </div>
            </>
          ) : (
            <>
              <div className="crown bouncy">🏆</div>
              <div className="winner-name champion-text">{winnerName}</div>
              <div className="winner-sub">
                wins with {winnerScore!.toLocaleString()} pts vs {loserScore!.toLocaleString()}
              </div>
            </>
          )}
        </div>

        <div className="results-grid">
          <div className="results-card" data-side="p1" data-winner={!tie && p1Wins}>
            {!tie && p1Wins && <div className="winner-glow" aria-hidden="true" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spriteFor(result.p1.starterDexId)} alt={result.p1.name} />
            <div className="name">{result.p1.name}</div>
            <div className="score">{result.p1.score.toLocaleString()} pts</div>
            {!tie && p1Wins && (
              <div className="winner-badge" aria-hidden="true">CHAMPION</div>
            )}
          </div>
          <div className="vs-divider">VS</div>
          <div className="results-card" data-side="p2" data-winner={!tie && !p1Wins}>
            {!tie && !p1Wins && <div className="winner-glow" aria-hidden="true" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spriteFor(result.p2.starterDexId)} alt={result.p2.name} />
            <div className="name">{result.p2.name}</div>
            <div className="score">{result.p2.score.toLocaleString()} pts</div>
            {!tie && !p1Wins && (
              <div className="winner-badge" aria-hidden="true">CHAMPION</div>
            )}
          </div>
        </div>

        <div className="q-foot" style={{ justifyContent: "center", gap: 14 }}>
          <button className="float-btn primary" onClick={onReplay}>
            Rematch
            <span aria-hidden="true" style={{ fontSize: 22 }}>›</span>
          </button>
          <button className="float-btn" onClick={onHome}>
            New Trainers
          </button>
          <Link href="#" className="float-btn" onClick={(e) => { e.preventDefault(); onHome(); }}>
            Main Menu
          </Link>
        </div>
      </section>
    </>
  );
}
