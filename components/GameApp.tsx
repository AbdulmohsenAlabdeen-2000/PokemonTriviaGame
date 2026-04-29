"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import MainMenuButton from "@/components/MainMenuButton";
import GameSelect from "@/components/stages/GameSelect";
import Welcome from "@/components/stages/Welcome";
import Setup, { type SetupResult } from "@/components/stages/Setup";
import Lobby from "@/components/stages/Lobby";
import Play, { type FinalResult } from "@/components/stages/Play";
import Results from "@/components/stages/Results";
import { gameById } from "@/lib/games/registry";
import type { GameConfig } from "@/lib/games/types";

type Stage = "select" | "welcome" | "setup" | "lobby" | "play" | "results";

const STORAGE_KEY = "trivia.lastGameId";

export default function GameApp() {
  const [stage, setStage] = useState<Stage>("select");
  const [game, setGame] = useState<GameConfig | null>(null);
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  // Apply the game's theme + music whenever the active game changes.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (game) {
      document.body.dataset.game = game.theme.bodyAttr;
      audio().setMusicConfig(game.id, game.music);
      try { sessionStorage.setItem(STORAGE_KEY, game.id); } catch { /* ignore */ }
    } else {
      delete document.body.dataset.game;
    }
  }, [game]);

  // On mount, optionally restore the last-played game so reloads don't lose it.
  useEffect(() => {
    try {
      const last = sessionStorage.getItem(STORAGE_KEY);
      if (last) {
        const cfg = gameById(last);
        if (cfg) setGame(cfg);
      }
    } catch { /* ignore */ }
  }, []);

  const goSelect = () => {
    setFinalResult(null);
    setSetupResult(null);
    setGame(null);
    setStage("select");
    audio().stopMusic();
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const goWelcome = () => {
    setFinalResult(null);
    setSetupResult(null);
    setStage("welcome");
  };

  const stageEl = (() => {
    if (stage === "select") {
      return (
        <GameSelect
          onSelect={(id) => {
            const cfg = gameById(id);
            if (!cfg) return;
            setGame(cfg);
            setStage("welcome");
          }}
        />
      );
    }
    if (!game) return null;
    if (stage === "welcome") {
      return <Welcome game={game} onStart={() => setStage("setup")} />;
    }
    if (stage === "setup") {
      return (
        <Setup
          game={game}
          onDone={(r) => {
            setSetupResult(r);
            setStage("lobby");
          }}
        />
      );
    }
    if (stage === "lobby" && setupResult) {
      return <Lobby game={game} setup={setupResult} onBegin={() => setStage("play")} />;
    }
    if (stage === "play" && setupResult) {
      return (
        <Play
          game={game}
          setup={setupResult}
          onDone={(r) => {
            setFinalResult(r);
            setStage("results");
          }}
        />
      );
    }
    if (stage === "results" && finalResult) {
      return (
        <Results
          result={finalResult}
          onReplay={() => {
            setFinalResult(null);
            setStage("lobby");
          }}
          onHome={goWelcome}
        />
      );
    }
    return null;
  })();

  return (
    <>
      {stageEl}
      {stage !== "select" && <MainMenuButton onExit={goSelect} />}
    </>
  );
}
