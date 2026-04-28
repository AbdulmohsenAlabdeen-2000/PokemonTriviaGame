"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import AnswerButton from "@/components/AnswerButton";
import { audio } from "@/lib/audio";
import {
  CATEGORIES,
  HARD_WRONG_PENALTY,
  categoryMeta,
  type Question
} from "@/lib/questions";
import { buildGameQuestionsFromAPI } from "@/lib/trivia-generator";
import { spriteFor, starterById } from "@/lib/pokedex";
import type { SetupResult } from "@/components/stages/Setup";

const PICKER_TIME = 60;     // seconds for picker to answer
const CHALLENGER_TIME = 15; // seconds for challenger to answer
/**
 * How long the reveal phase lasts before auto-advancing back to the board.
 * Correct answers wait longer so the YT correct-answer track has time to play.
 */
const REVEAL_PAUSE_CORRECT_MS = 7000;
const REVEAL_PAUSE_WRONG_MS   = 3000;

const TILE_BALL_FOR_DIFFICULTY: Record<"easy" | "medium" | "hard", string> = {
  easy:   "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
  medium: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",
  hard:   "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png"
};

export type FinalResult = {
  p1: { name: string; starterDexId: number; score: number };
  p2: { name: string; starterDexId: number; score: number };
};

type Phase = "loading" | "load-error" | "board" | "picker" | "challenger" | "reveal" | "done";

type State = {
  phase: Phase;
  /** All 36 questions for this game — fetched from PokeAPI on mount. */
  questions: Question[];
  /** Player who picked the tile and answers first (60s). */
  pickerIdx: 0 | 1;
  scores: [number, number];
  used: Set<string>;
  current: Question | null;
  /** Picker's selected option index (or null if they timed out). */
  pickerPick: 0 | 1 | 2 | 3 | null;
  /** Challenger's selected option index (or null if they timed out). */
  challengerPick: 0 | 1 | 2 | 3 | null;
  /** Computed at reveal time — whether each player got it right. */
  pickerCorrect: boolean;
  challengerCorrect: boolean;
  /** Per-player score deltas applied by this question (for the bump animation). */
  lastDeltas: [number, number];
  timeLeft: number;
  warningFired: boolean;
  /** Error message from the trivia-generator if the API fetch failed. */
  loadError: string | null;
};

type Action =
  | { type: "QUESTIONS_LOADED"; questions: Question[] }
  | { type: "QUESTIONS_FAILED"; error: string }
  | { type: "PICK"; question: Question }
  | { type: "PICKER_ANSWER"; option: 0 | 1 | 2 | 3 }
  | { type: "CHALLENGER_ANSWER"; option: 0 | 1 | 2 | 3 }
  | { type: "PICKER_TIMEOUT" }
  | { type: "CHALLENGER_TIMEOUT" }
  | { type: "TICK"; dt: number }
  | { type: "WARNING_DONE" }
  | { type: "RETURN_TO_BOARD" };

function shuffleAnswers(q: Question): Question {
  const idx = q.options.map((opt, i) => ({ opt, isAnswer: i === q.answerIndex }));
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return {
    ...q,
    options: idx.map((x) => x.opt) as [string, string, string, string],
    answerIndex: idx.findIndex((x) => x.isAnswer) as 0 | 1 | 2 | 3
  };
}

/** Apply scoring for a single player given their pick + the question. */
function deltaFor(pick: 0 | 1 | 2 | 3 | null, q: Question): number {
  if (pick === null) return 0; // timeout = no points, no penalty
  if (pick === q.answerIndex) return q.value;          // correct
  if (q.difficulty === "hard") return HARD_WRONG_PENALTY; // wrong on hard
  return 0;                                            // wrong but not hard
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUESTIONS_LOADED": {
      if (state.phase !== "loading") return state;
      return { ...state, phase: "board", questions: action.questions, loadError: null };
    }
    case "QUESTIONS_FAILED": {
      return { ...state, phase: "load-error", loadError: action.error };
    }
    case "PICK": {
      if (state.phase !== "board") return state;
      if (state.used.has(action.question.id)) return state;
      return {
        ...state,
        phase: "picker",
        current: shuffleAnswers(action.question),
        pickerPick: null,
        challengerPick: null,
        pickerCorrect: false,
        challengerCorrect: false,
        lastDeltas: [0, 0],
        timeLeft: PICKER_TIME,
        warningFired: false
      };
    }
    case "TICK": {
      if (state.phase !== "picker" && state.phase !== "challenger") return state;
      const next = Math.max(0, state.timeLeft - action.dt);
      if (next === 0) {
        if (state.phase === "picker") return reducer(state, { type: "PICKER_TIMEOUT" });
        return reducer(state, { type: "CHALLENGER_TIMEOUT" });
      }
      return { ...state, timeLeft: next };
    }
    case "WARNING_DONE":
      return { ...state, warningFired: true };

    case "PICKER_ANSWER": {
      if (state.phase !== "picker") return state;
      return {
        ...state,
        phase: "challenger",
        pickerPick: action.option,
        timeLeft: CHALLENGER_TIME,
        warningFired: false
      };
    }
    case "PICKER_TIMEOUT": {
      if (state.phase !== "picker") return state;
      return {
        ...state,
        phase: "challenger",
        pickerPick: null,
        timeLeft: CHALLENGER_TIME,
        warningFired: false
      };
    }
    case "CHALLENGER_ANSWER":
    case "CHALLENGER_TIMEOUT": {
      if (state.phase !== "challenger" || state.current == null) return state;
      const challengerPick =
        action.type === "CHALLENGER_ANSWER" ? action.option : null;
      const q = state.current;
      const challengerIdx = (state.pickerIdx === 0 ? 1 : 0) as 0 | 1;
      const pickerDelta = deltaFor(state.pickerPick, q);
      const challengerDelta = deltaFor(challengerPick, q);
      const scores: [number, number] = [...state.scores] as [number, number];
      scores[state.pickerIdx]   = scores[state.pickerIdx]   + pickerDelta;
      scores[challengerIdx]     = scores[challengerIdx]     + challengerDelta;
      const lastDeltas: [number, number] = [0, 0];
      lastDeltas[state.pickerIdx] = pickerDelta;
      lastDeltas[challengerIdx]   = challengerDelta;
      return {
        ...state,
        phase: "reveal",
        challengerPick,
        pickerCorrect:    state.pickerPick   !== null && state.pickerPick   === q.answerIndex,
        challengerCorrect: challengerPick    !== null && challengerPick     === q.answerIndex,
        scores,
        lastDeltas,
        timeLeft: 0
      };
    }
    case "RETURN_TO_BOARD": {
      if (state.phase !== "reveal" || state.current == null) return state;
      const used = new Set(state.used);
      used.add(state.current.id);
      const allDone = used.size >= state.questions.length;
      const nextPicker = (state.pickerIdx === 0 ? 1 : 0) as 0 | 1;
      if (allDone) return { ...state, phase: "done", used };
      return {
        ...state,
        phase: "board",
        used,
        pickerIdx: nextPicker,
        current: null,
        pickerPick: null,
        challengerPick: null,
        pickerCorrect: false,
        challengerCorrect: false,
        lastDeltas: [0, 0],
        timeLeft: PICKER_TIME,
        warningFired: false
      };
    }
    default:
      return state;
  }
}

export default function Play({
  setup,
  onDone
}: {
  setup: SetupResult;
  onDone: (r: FinalResult) => void;
}) {
  const [state, dispatch] = useReducer(reducer, undefined as never, () => ({
    phase: "loading" as Phase,
    questions: [] as Question[],
    pickerIdx: 0 as 0 | 1,
    scores: [0, 0] as [number, number],
    used: new Set<string>(),
    current: null,
    pickerPick: null,
    challengerPick: null,
    pickerCorrect: false,
    challengerCorrect: false,
    lastDeltas: [0, 0] as [number, number],
    timeLeft: PICKER_TIME,
    warningFired: false,
    loadError: null
  }));

  // Fetch questions from PokeAPI on mount.
  useEffect(() => {
    let cancelled = false;
    buildGameQuestionsFromAPI()
      .then((questions) => {
        if (cancelled) return;
        dispatch({ type: "QUESTIONS_LOADED", questions });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        dispatch({ type: "QUESTIONS_FAILED", error: err?.message || "Failed to load PokeAPI" });
      });
    return () => { cancelled = true; };
  }, []);

  const p1Star = starterById(setup.p1.starter);
  const p2Star = starterById(setup.p2.starter);

  // ---------- Music switching: only ONE track at a time ----------
  useEffect(() => { audio().preload([25, 202]); }, []);
  useEffect(() => {
    if (state.phase === "loading")          audio().playLobby();
    else if (state.phase === "load-error")  audio().stopMusic();
    else if (state.phase === "board")       audio().playLobby();
    else if (state.phase === "picker")      audio().playBattle();   // YT (or synth fallback)
    else if (state.phase === "challenger")  {/* keep battle music going */ }
    else if (state.phase === "reveal")      audio().stopMusic();
    else if (state.phase === "done")        audio().stopMusic();
  }, [state.phase]);

  // ---------- Timer ----------
  useEffect(() => {
    if (state.phase !== "picker" && state.phase !== "challenger") return;
    const id = window.setInterval(() => dispatch({ type: "TICK", dt: 0.1 }), 100);
    return () => window.clearInterval(id);
  }, [state.phase, state.current?.id]);

  useEffect(() => {
    if (state.phase !== "picker" && state.phase !== "challenger") return;
    const threshold = state.phase === "picker" ? 10 : 5;
    if (!state.warningFired && state.timeLeft <= threshold && state.timeLeft > 0) {
      audio().playWarning();
      dispatch({ type: "WARNING_DONE" });
    }
  }, [state.phase, state.timeLeft, state.warningFired]);

  // ---------- Reveal: SFX + auto-advance with a visible progress bar ----------
  // Correct: only the YT correct-answer track plays (no Pikachu cry on top)
  // Wrong / timeout: Wobbuffet cry + synth defeat sting
  useEffect(() => {
    if (state.phase !== "reveal") return;
    const anyoneCorrect = state.pickerCorrect || state.challengerCorrect;
    if (anyoneCorrect) {
      audio().playCorrectMusic();      // YT correct-answer track only
    } else {
      audio().playWrong();
      audio().playDefeat();
    }
    const pauseMs = anyoneCorrect ? REVEAL_PAUSE_CORRECT_MS : REVEAL_PAUSE_WRONG_MS;
    const t = window.setTimeout(
      () => dispatch({ type: "RETURN_TO_BOARD" }),
      pauseMs
    );
    return () => window.clearTimeout(t);
  }, [state.phase, state.pickerCorrect, state.challengerCorrect]);

  // ---------- Game over ----------
  useEffect(() => {
    if (state.phase !== "done") return;
    audio().stopMusic();
    const t = window.setTimeout(() => {
      onDone({
        p1: { name: setup.p1.name, starterDexId: p1Star.dexId, score: state.scores[0] },
        p2: { name: setup.p2.name, starterDexId: p2Star.dexId, score: state.scores[1] }
      });
    }, 600);
    return () => window.clearTimeout(t);
  }, [state.phase, state.scores, onDone, setup.p1.name, setup.p2.name, p1Star.dexId, p2Star.dexId]);

  // ---------- Score-bump flag ----------
  const [bumpedSide, setBumpedSide] = useState<0 | 1 | null>(null);
  const bumpRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (state.phase === "reveal") {
      // Bump whichever side had a non-zero delta. If both, pick the picker.
      if (state.lastDeltas[state.pickerIdx] !== 0) setBumpedSide(state.pickerIdx);
      else if (state.lastDeltas[(state.pickerIdx === 0 ? 1 : 0) as 0 | 1] !== 0)
        setBumpedSide((state.pickerIdx === 0 ? 1 : 0) as 0 | 1);
      if (bumpRef.current) clearTimeout(bumpRef.current);
      bumpRef.current = setTimeout(() => setBumpedSide(null), 700);
    }
  }, [state.phase, state.lastDeltas, state.pickerIdx]);
  useEffect(() => () => { if (bumpRef.current) clearTimeout(bumpRef.current); }, []);

  // ---------- Render ----------
  const challengerIdx = (state.pickerIdx === 0 ? 1 : 0) as 0 | 1;

  // Loading + error screens come before the regular play layout.
  if (state.phase === "loading") {
    return <LoadingScreen />;
  }
  if (state.phase === "load-error") {
    return <ErrorScreen message={state.loadError || "Unknown error"} />;
  }

  return (
    <div className="play-grid stage">
      {/* LEFT — board OR question card */}
      <div className="play-main">
        {(state.phase === "board" || state.phase === "done") && (
          <Board
            used={state.used}
            questions={state.questions}
            pickerName={state.pickerIdx === 0 ? setup.p1.name : setup.p2.name}
            pickerColor={state.pickerIdx === 0 ? "var(--color-poke-red)" : "var(--color-poke-blue)"}
            done={state.phase === "done"}
            onPick={(q) => dispatch({ type: "PICK", question: q })}
          />
        )}
        {(state.phase === "picker" || state.phase === "challenger" || state.phase === "reveal") &&
          state.current && (
            <QuestionView
              q={state.current}
              phase={state.phase}
              timeLeft={state.timeLeft}
              revealDurationMs={
                state.pickerCorrect || state.challengerCorrect
                  ? REVEAL_PAUSE_CORRECT_MS
                  : REVEAL_PAUSE_WRONG_MS
              }
              picker={state.pickerIdx === 0
                ? { name: setup.p1.name, side: "p1" as const, color: "var(--color-poke-red)" }
                : { name: setup.p2.name, side: "p2" as const, color: "var(--color-poke-blue)" }}
              challenger={challengerIdx === 0
                ? { name: setup.p1.name, side: "p1" as const, color: "var(--color-poke-red)" }
                : { name: setup.p2.name, side: "p2" as const, color: "var(--color-poke-blue)" }}
              pickerPick={state.pickerPick}
              challengerPick={state.challengerPick}
              pickerCorrect={state.pickerCorrect}
              challengerCorrect={state.challengerCorrect}
              onPickerAnswer={(o) => dispatch({ type: "PICKER_ANSWER", option: o })}
              onChallengerAnswer={(o) => dispatch({ type: "CHALLENGER_ANSWER", option: o })}
            />
          )}
      </div>

      {/* RIGHT — team panels */}
      <aside className="team-panels">
        <TeamPanel
          side="p1"
          name={setup.p1.name}
          starterDex={p1Star.dexId}
          starterName={p1Star.name}
          starterType={p1Star.type}
          starterTypeClass={p1Star.typeClass}
          score={state.scores[0]}
          isPicker={state.pickerIdx === 0 && (state.phase === "board" || state.phase === "picker" || state.phase === "challenger")}
          isAnswering={
            (state.phase === "picker"     && state.pickerIdx === 0) ||
            (state.phase === "challenger" && state.pickerIdx === 1)
          }
          bump={bumpedSide === 0}
        />
        <TeamPanel
          side="p2"
          name={setup.p2.name}
          starterDex={p2Star.dexId}
          starterName={p2Star.name}
          starterType={p2Star.type}
          starterTypeClass={p2Star.typeClass}
          score={state.scores[1]}
          isPicker={state.pickerIdx === 1 && (state.phase === "board" || state.phase === "picker" || state.phase === "challenger")}
          isAnswering={
            (state.phase === "picker"     && state.pickerIdx === 1) ||
            (state.phase === "challenger" && state.pickerIdx === 0)
          }
          bump={bumpedSide === 1}
        />
        <div className="hud-pill" style={{ textAlign: "center" }}>
          {state.phase === "done"
            ? "Battle complete"
            : `${state.questions.length - state.used.size} questions left`}
        </div>
      </aside>
    </div>
  );
}

// =====================================================================
// SUBCOMPONENTS
// =====================================================================

function Board({
  used,
  questions,
  pickerName,
  pickerColor,
  done,
  onPick
}: {
  used: Set<string>;
  questions: Question[];
  pickerName: string;
  pickerColor: string;
  done: boolean;
  onPick: (q: Question) => void;
}) {
  return (
    <section className="card board-card">
      <div className="board-banner">
        {done ? (
          <span>All questions answered — tallying up the result…</span>
        ) : (
          <span>
            <strong style={{ color: pickerColor }}>{pickerName}</strong>, pick a category and a value
          </span>
        )}
      </div>
      <div className="board" role="grid" aria-label="Trivia board">
        {CATEGORIES.map((cat) => {
          const cells = questions
            .filter((q) => q.category === cat.id)
            .sort((a, b) => a.value - b.value);
          return (
            <div key={cat.id} className="board-col">
              <div className="board-col-head">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.icon}
                  alt={cat.iconAlt}
                  className={`board-col-icon${cat.id === "PokeBalls" ? " pixel" : ""}`}
                />
                <div className="board-col-label">{cat.label}</div>
              </div>
              <div className="board-col-cells">
                {cells.map((q) => {
                  const isUsed = used.has(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className="tile"
                      data-difficulty={q.difficulty}
                      data-used={isUsed}
                      disabled={isUsed || done}
                      onMouseEnter={() => { if (!isUsed) audio().playHover(); }}
                      onClick={() => {
                        if (isUsed || done) return;
                        audio().playClick();
                        onPick(q);
                      }}
                      aria-label={`${cat.label} for ${q.value} points`}
                    >
                      {!isUsed && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="tile-ball"
                            src={TILE_BALL_FOR_DIFFICULTY[q.difficulty]}
                            alt=""
                            aria-hidden="true"
                          />
                          <span className="tile-value">{q.value}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type Trainer = { name: string; side: "p1" | "p2"; color: string };

function QuestionView({
  q, phase, timeLeft, revealDurationMs,
  picker, challenger,
  pickerPick, challengerPick,
  pickerCorrect, challengerCorrect,
  onPickerAnswer, onChallengerAnswer
}: {
  q: Question;
  phase: "picker" | "challenger" | "reveal";
  timeLeft: number;
  revealDurationMs: number;
  picker: Trainer;
  challenger: Trainer;
  pickerPick: 0 | 1 | 2 | 3 | null;
  challengerPick: 0 | 1 | 2 | 3 | null;
  pickerCorrect: boolean;
  challengerCorrect: boolean;
  onPickerAnswer: (o: 0 | 1 | 2 | 3) => void;
  onChallengerAnswer: (o: 0 | 1 | 2 | 3) => void;
}) {
  const meta = categoryMeta(q.category);
  const totalForPhase = phase === "picker" ? PICKER_TIME : phase === "challenger" ? CHALLENGER_TIME : 1;
  const dangerThreshold = phase === "picker" ? 10 : phase === "challenger" ? 5 : 0;
  const warnThreshold   = phase === "picker" ? 30 : phase === "challenger" ? 10 : 0;
  const timerZone =
    phase === "reveal" ? "ok" :
    timeLeft > warnThreshold ? "ok" :
    timeLeft > dangerThreshold ? "warn" : "danger";
  const pct = phase === "reveal" ? 0 : Math.max(0, Math.min(100, (timeLeft / totalForPhase) * 100));

  const activeName = phase === "picker" ? picker.name : phase === "challenger" ? challenger.name : null;
  const activeSide = phase === "picker" ? picker.side : phase === "challenger" ? challenger.side : null;

  return (
    <section className="card question-card">
      <div className="q-meta">
        <span className="q-pill cat">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.icon} alt="" aria-hidden="true"
            className={`q-pill-icon${meta.id === "PokeBalls" ? " pixel" : ""}`}
          />
          {meta.label}
        </span>
        <span className="q-pill val" data-value={q.value}>{q.value} pts</span>
        {activeName && activeSide && (
          <span className="q-pill turn" data-side={activeSide}>
            {activeName}'s turn
          </span>
        )}
        {phase === "challenger" && (
          <span className="q-pill" style={{ background: "#fff5b8", border: "2px solid var(--color-poke-ink)" }}>
            15s STEAL
          </span>
        )}
        {phase === "reveal" && (
          <span className="q-pill" style={{
            background: pickerCorrect || challengerCorrect ? "#6dd16a" : "#ee1515",
            color: "white", border: "2px solid var(--color-poke-ink)"
          }}>
            {pickerCorrect && challengerCorrect ? "BOTH CORRECT" :
             pickerCorrect ? `${picker.name} CORRECT` :
             challengerCorrect ? `${challenger.name} CORRECT` :
             "BOTH WRONG"}
          </span>
        )}
      </div>

      {phase !== "reveal" && (
        <div className="q-timer" data-zone={timerZone}>
          <div className="q-timer-bar"><span style={{ width: `${pct}%` }} /></div>
          <div className="q-timer-text">{Math.ceil(timeLeft)}s</div>
        </div>
      )}

      <div className="q-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={q.id}
          className={`q-image${q.category === "PokeBalls" ? " pixel" : ""}`}
          src={q.image} alt="" aria-hidden="true"
        />
      </div>

      <p className="q-prompt">{q.prompt}</p>

      <div className="answers">
        {q.options.map((opt, i) => {
          const idx = i as 0 | 1 | 2 | 3;
          // Determine ownership tag (shows in challenger phase + reveal)
          let ownership: "p1" | "p2" | "both" | null = null;
          const showOwnership = phase === "challenger" || phase === "reveal";
          if (showOwnership) {
            const pickerHere = pickerPick === idx;
            const challengerHere = challengerPick === idx;
            if (pickerHere && challengerHere) ownership = "both";
            else if (pickerHere) ownership = picker.side;
            else if (challengerHere) ownership = challenger.side;
          }
          // Visual state
          let stateProp: "correct" | "wrong" | "muted" | undefined;
          if (phase === "reveal") {
            if (idx === q.answerIndex) stateProp = "correct";
            else if (pickerPick === idx || challengerPick === idx) stateProp = "wrong";
            else stateProp = "muted";
          }
          // The picker's answer is "locked & greyed" during the challenger phase.
          // The challenger CANNOT pick the same option — so it's also disabled.
          const pickerLocked = phase === "challenger" && pickerPick === idx;
          // Disabled rules:
          //   - reveal: all disabled
          //   - picker phase: enabled (picker is choosing)
          //   - challenger phase: every option except the picker's pick is enabled
          const disabled = phase === "reveal" || pickerLocked;
          const onSelect = (o: 0 | 1 | 2 | 3) => {
            if (phase === "picker") onPickerAnswer(o);
            else if (phase === "challenger") onChallengerAnswer(o);
          };
          return (
            <AnswerButton
              key={i}
              index={idx}
              text={opt}
              state={stateProp}
              ownership={ownership}
              pickerLocked={pickerLocked}
              disabled={disabled}
              onSelect={onSelect}
            />
          );
        })}
      </div>

      <div className="q-foot">
        <span style={{ color: "#666", fontSize: 14, fontWeight: 600 }}>
          {phase === "picker" &&
            `${picker.name} — choose A, B, C or D within 60 seconds.`}
          {phase === "challenger" && pickerPick !== null &&
            `${challenger.name} — your turn! 15 seconds to lock in your answer.`}
          {phase === "challenger" && pickerPick === null &&
            `${picker.name} timed out. ${challenger.name}, you have 15 seconds.`}
          {phase === "reveal" && pickerCorrect && challengerCorrect &&
            `Both trainers got it! +${q.value} each.`}
          {phase === "reveal" && pickerCorrect && !challengerCorrect &&
            `${picker.name} caught it! +${q.value}.`}
          {phase === "reveal" && !pickerCorrect && challengerCorrect &&
            `${challenger.name} stole it! +${q.value}.`}
          {phase === "reveal" && !pickerCorrect && !challengerCorrect && q.difficulty === "hard" &&
            `Both wrong on a hard question. ${HARD_WRONG_PENALTY} for any player who answered.`}
          {phase === "reveal" && !pickerCorrect && !challengerCorrect && q.difficulty !== "hard" &&
            `Neither trainer caught it.`}
        </span>
      </div>

      {phase === "reveal" && (
        <div className="reveal-progress" aria-live="polite">
          <div className="reveal-progress-label">
            Returning to the board for the next question…
          </div>
          <div className="reveal-progress-bar">
            <span
              key={`${pickerCorrect}-${challengerCorrect}`}
              style={{ animationDuration: `${revealDurationMs}ms` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function TeamPanel({
  side, name, starterDex, starterName, starterType, starterTypeClass,
  score, isPicker, isAnswering, bump
}: {
  side: "p1" | "p2";
  name: string;
  starterDex: number;
  starterName: string;
  starterType: string;
  starterTypeClass: string;
  score: number;
  isPicker: boolean;
  isAnswering: boolean;
  bump: boolean;
}) {
  return (
    <div className="team-panel" data-side={side} data-active={isAnswering} data-picker={isPicker}>
      <div className="team-panel-head">
        <span className="team-tag">{side === "p1" ? "Team 1" : "Team 2"}</span>
        {isAnswering ? (
          <span className="team-state answering">Answering</span>
        ) : isPicker ? (
          <span className="team-state your-turn">Your Turn</span>
        ) : (
          <span className="team-state waiting">Waiting</span>
        )}
      </div>
      <div className="team-panel-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="team-avatar" src={spriteFor(starterDex)} alt={starterName} />
        <div className="team-meta">
          <div className="team-name">{name}</div>
          <div className={`team-score ${bump ? "bump" : ""}`}>
            {score.toLocaleString()}
          </div>
          <div className="team-poke">
            <span className={`type-badge ${starterTypeClass}`}>{starterType}</span>
            <span className="team-poke-name">{starterName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading screen — shown while we fetch question data from PokeAPI on mount.
function LoadingScreen() {
  return (
    <section className="card stage" style={{ textAlign: "center" }}>
      <div className="loading-pokeball" aria-hidden="true">
        <div className="lp-top" />
        <div className="lp-bottom" />
        <div className="lp-belt" />
        <div className="lp-button" />
      </div>
      <h2 className="title" style={{ fontSize: "clamp(22px, 4vw, 36px)", marginTop: 8 }}>
        Loading Pokémon data…
      </h2>
      <p className="subtitle" style={{ marginTop: 6 }}>
        Building 36 fresh questions from PokeAPI.
      </p>
    </section>
  );
}

// Error screen — shown if the PokeAPI fetch fails (network down, etc.).
function ErrorScreen({ message }: { message: string }) {
  return (
    <section className="card stage" style={{ textAlign: "center" }}>
      <div className="crown" style={{ fontSize: 64 }}>⚠️</div>
      <h2 className="title" style={{ fontSize: "clamp(22px, 4vw, 36px)" }}>
        Could not reach PokeAPI
      </h2>
      <p className="subtitle" style={{ marginTop: 6, color: "#666" }}>
        {message}
      </p>
      <p className="subtitle" style={{ marginTop: 14 }}>
        Check your internet connection and reload the page.
      </p>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        <button
          className="float-btn primary"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </section>
  );
}
