"use client";

import { audio } from "@/lib/audio";

const LETTERS = ["A", "B", "C", "D"] as const;

export type AnswerOwnership = "p1" | "p2" | "both" | null;

export default function AnswerButton({
  index,
  text,
  state,
  disabled,
  /** Which player(s) selected this option (shown as small tag in bottom-right). */
  ownership = null,
  /** True after the picker has answered but before the challenger has, while
   *  this option was the picker's pick — render greyed-out as a hint. */
  pickerLocked = false,
  onSelect
}: {
  index: 0 | 1 | 2 | 3;
  text: string;
  state?: "correct" | "wrong" | "muted";
  disabled?: boolean;
  ownership?: AnswerOwnership;
  pickerLocked?: boolean;
  onSelect: (index: 0 | 1 | 2 | 3) => void;
}) {
  return (
    <button
      type="button"
      className="answer-btn"
      style={{ ["--i" as string]: index }}
      data-state={state}
      data-picker-locked={pickerLocked}
      disabled={disabled}
      onMouseEnter={() => { if (!disabled) audio().playHover(); }}
      onClick={() => {
        if (disabled) return;
        audio().playClick();
        onSelect(index);
      }}
    >
      <span className="letter">{LETTERS[index]}</span>
      <span style={{ flex: 1 }}>{text}</span>
      {ownership && (
        <span className={`answer-owner ${ownership}`} aria-hidden="true">
          {ownership === "both" ? "P1 · P2" : ownership === "p1" ? "P1" : "P2"}
        </span>
      )}
    </button>
  );
}
