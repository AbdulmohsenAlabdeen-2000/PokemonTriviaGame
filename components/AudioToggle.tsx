"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

export default function AudioToggle() {
  const [muted, setMuted] = useState(false);
  useEffect(() => { setMuted(audio().isMuted()); }, []);

  const toggle = async () => {
    const next = !muted;
    audio().setMuted(next);
    if (!next) await audio().resume();
    setMuted(next);
  };

  return (
    <button
      className="audio-toggle"
      onClick={toggle}
      aria-pressed={!muted}
      title={muted ? "Sound is off" : "Sound is on"}
    >
      <span className="icon" aria-hidden="true">{muted ? "♪" : "♫"}</span>
      <span className="label">{muted ? "Sound Off" : "Sound On"}</span>
    </button>
  );
}
