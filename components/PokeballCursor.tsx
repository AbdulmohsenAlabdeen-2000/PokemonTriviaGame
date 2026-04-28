"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pokeball-shaped cursor that follows the mouse and plays an opening
 * (capture) animation on every click. Skipped on touch devices.
 */
export default function PokeballCursor() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Only mount on devices with a real fine pointer
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
      void el.offsetWidth; // restart animation
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
        <div className="pb-top" />
        <div className="pb-bottom" />
        <div className="pb-belt" />
        <div className="pb-button" />
      </div>
    </div>
  );
}
