"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import MainMenuButton from "@/components/MainMenuButton";
import Welcome from "@/components/stages/Welcome";
import Setup, { type SetupResult } from "@/components/stages/Setup";
import Lobby from "@/components/stages/Lobby";
import Play, { type FinalResult } from "@/components/stages/Play";
import Results from "@/components/stages/Results";

type Stage = "welcome" | "setup" | "lobby" | "play" | "results";

export default function GameApp() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  useEffect(() => { audio().playWelcome(); }, []);

  const goHome = () => {
    setFinalResult(null);
    setSetupResult(null);
    setStage("welcome");
  };

  const stageEl = (() => {
    if (stage === "welcome") return <Welcome onStart={() => setStage("setup")} />;
    if (stage === "setup") {
      return (
        <Setup
          onDone={(r) => {
            setSetupResult(r);
            setStage("lobby");
          }}
        />
      );
    }
    if (stage === "lobby" && setupResult) {
      return <Lobby setup={setupResult} onBegin={() => setStage("play")} />;
    }
    if (stage === "play" && setupResult) {
      return (
        <Play
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
          onHome={goHome}
        />
      );
    }
    return null;
  })();

  return (
    <>
      {stageEl}
      {stage !== "welcome" && <MainMenuButton onExit={goHome} />}
    </>
  );
}
