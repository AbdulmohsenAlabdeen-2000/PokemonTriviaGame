"use client";

import { useEffect, useRef, useState } from "react";
import { CS_BUTTERFLY_EMERALD } from "@/lib/games/cs2/icons";

// Real game-asset cursor sources. Each is hot-link friendly and small enough
// to read at 32-36px after CSS scaling.
const MC_DIAMOND_SWORD = "https://minecraft.wiki/Special:FilePath/Diamond_Sword.png";
// High-res 3D render rather than the small UI icon
const ARC_SENTINEL =
  "https://unhbvkszwhczbjxgetgk.supabase.co/storage/v1/object/public/images/arc-raiders/images/sentinel.webp";

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
        {/* Per-game cursor — real Minecraft Diamond Sword PNG (16px pixel art) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pb-mc-sword" src={MC_DIAMOND_SWORD} alt="" />
        {/* Per-game cursor — real ARC Raiders Sentinel enemy icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pb-arc-reticle" src={ARC_SENTINEL} alt="" />
        {/* Per-game cursor — real Butterfly Knife | Gamma Doppler (emerald phase) skin */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pb-cs-butterfly" src={CS_BUTTERFLY_EMERALD} alt="" />
      </div>
    </div>
  );
}
