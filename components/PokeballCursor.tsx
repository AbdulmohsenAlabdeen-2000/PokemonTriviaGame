"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Game-aware floating cursor that follows the mouse and plays a "capture"
 * animation on every click.
 *
 * The default cursor (when no game is active) is the Pokémon Poké Ball —
 * a four-element CSS shape (top half, bottom half, belt, button). When a
 * game is active, the GameApp sets `body[data-cursor="<game>"]` and
 * additional CSS rules in globals.css swap the inner SVG for that game's
 * thematic cursor (Diamond Sword for Minecraft, ARC reticle for ARC
 * Raiders).
 *
 * Skipped on touch devices — `(hover: hover) and (pointer: fine)` only.
 */
export default function PokeballCursor() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      cx += (tx - cx) * 0.4;
      cy += (ty - cy) * 0.4;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    const onDown = () => {
      el.classList.remove("click");
      void el.offsetWidth;
      el.classList.add("click");
    };
    const onAnimEnd = () => el.classList.remove("click");
    const onEnter = () => (el.style.opacity = "1");
    const onLeave = () => (el.style.opacity = "0");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseleave", onLeave);
    el.addEventListener("animationend", onAnimEnd);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("animationend", onAnimEnd);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className="pb-cursor" aria-hidden="true">
      <div className="pb-spark" />
      <div className="pb-shake">
        {/* Default Poké Ball cursor — hidden when body[data-cursor] is set */}
        <div className="pb-default">
          <div className="pb-top" />
          <div className="pb-bottom" />
          <div className="pb-belt" />
          <div className="pb-button" />
        </div>
        {/* Per-game cursor — Minecraft Diamond Sword */}
        <svg className="pb-mc-sword" viewBox="0 0 32 32" aria-hidden="true">
          {/* Hilt */}
          <rect x="4" y="22" width="6" height="6" fill="#7e4c1c" stroke="#1b1b1b" strokeWidth="1"/>
          {/* Crossguard */}
          <rect x="2" y="20" width="10" height="2" fill="#3a2310" stroke="#1b1b1b" strokeWidth="1"/>
          {/* Blade — diamond cyan with darker edge */}
          <polygon
            points="10,18 18,10 22,12 26,8 28,10 12,26 10,24"
            fill="#5dd3e0"
            stroke="#1b1b1b"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <polygon
            points="12,18 18,12 24,14 14,24"
            fill="#a8e8f0"
          />
        </svg>
        {/* Per-game cursor — ARC Raiders targeting reticle */}
        <svg className="pb-arc-reticle" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#d4a14a" strokeWidth="1.8"/>
          <circle cx="16" cy="16" r="9" fill="none" stroke="#d4a14a" strokeWidth="1.2" opacity="0.65"/>
          <circle cx="16" cy="16" r="1.6" fill="#ee1515"/>
          {/* Crosshair tick marks at NSEW */}
          <line x1="16" y1="0"  x2="16" y2="6"  stroke="#d4a14a" strokeWidth="1.8"/>
          <line x1="16" y1="26" x2="16" y2="32" stroke="#d4a14a" strokeWidth="1.8"/>
          <line x1="0"  y1="16" x2="6"  y2="16" stroke="#d4a14a" strokeWidth="1.8"/>
          <line x1="26" y1="16" x2="32" y2="16" stroke="#d4a14a" strokeWidth="1.8"/>
        </svg>
      </div>
    </div>
  );
}
