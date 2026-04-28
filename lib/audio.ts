/**
 * Audio manager for Pokemon Trivia Arena.
 *
 * - Cries:    PokeAPI cries CDN (real Pokemon sounds)
 * - Music:    synthesized live with Web Audio (square + triangle waves —
 *             the same waveforms the Game Boy sound chip used). Three modes:
 *             "welcome" (peaceful), "lobby" (warm), "battle" (urgent).
 * - UI SFX:   short synthesized blips (button click, timer warning, transitions)
 *
 * All audio is unlocked by a user gesture via resume() — call it on the very
 * first click of any "Start" button.
 */

import {
  allYtPlayers,
  ytPlayer,
  VIDEO_LOBBY,
  VIDEO_BATTLE,
  VIDEO_CORRECT,
  VIDEO_WINNER,
  type YouTubeMusic
} from "./youtube";

const CRY_BASE = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest";

/**
 * Identifiers for the YT players. The audio manager treats them all as
 * mutually exclusive — starting one pauses every other and silences the
 * synth music gain.
 */
function ytLobby()   { return ytPlayer("lobby",   VIDEO_LOBBY); }
function ytBattle()  { return ytPlayer("battle",  VIDEO_BATTLE); }
function ytCorrect() { return ytPlayer("correct", VIDEO_CORRECT); }
function ytWinner()  { return ytPlayer("winner",  VIDEO_WINNER); }

const NOTE: Record<string, number> = {
  C2: 65.41,  E2: 82.41,  G2: 98.0,  A2: 110.0,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98
};

// ---------- Welcome theme (peaceful Pokemon Center vibe, 84 BPM, C major) ----------
const WELCOME_BPM = 84;
const WELCOME_LEAD: [string, number][] = [
  ["E5", 1], ["G5", 1], ["C6", 1], ["G5", 1],
  ["E5", 1], ["D5", 1], ["C5", 2],
  ["F5", 1], ["A5", 1], ["C6", 1], ["A5", 1],
  ["F5", 1], ["E5", 1], ["D5", 2],
  ["G5", 1], ["B5", 1], ["D6", 1], ["B5", 1],
  ["G5", 1], ["F5", 1], ["E5", 2],
  ["F5", 1], ["E5", 1], ["D5", 1], ["C5", 1],
  ["C5", 4]
];
const WELCOME_BASS: [string, number][] = [
  ["C3", 2], ["G3", 2], ["C3", 2], ["G3", 2],
  ["F3", 2], ["C4", 2], ["F3", 2], ["A3", 2],
  ["G3", 2], ["D4", 2], ["G3", 2], ["B3", 2],
  ["F3", 2], ["G3", 2], ["C3", 2], ["C3", 2]
];

// ---------- Lobby theme (warm, FireRed-style, 96 BPM, F major) ----------
const LOBBY_BPM = 96;
const LOBBY_LEAD: [string, number][] = [
  ["F5", 0.5], ["A5", 0.5], ["C6", 0.5], ["A5", 0.5],
  ["F5", 0.5], ["A5", 0.5], ["C6", 1],
  ["G5", 0.5], ["B5", 0.5], ["D6", 0.5], ["B5", 0.5],
  ["G5", 0.5], ["B5", 0.5], ["D6", 1],
  ["A5", 0.5], ["C6", 0.5], ["F6", 0.5], ["C6", 0.5],
  ["A5", 0.5], ["G5", 0.5], ["F5", 1],
  ["E5", 0.5], ["F5", 0.5], ["G5", 0.5], ["A5", 0.5],
  ["F5", 1.5], ["rest", 0.5]
];
const LOBBY_BASS: [string, number][] = [
  ["F3", 1], ["C4", 1], ["F3", 1], ["C4", 1],
  ["G3", 1], ["D4", 1], ["G3", 1], ["D4", 1],
  ["A3", 1], ["F3", 1], ["A3", 1], ["F3", 1],
  ["C3", 1], ["F3", 1], ["F3", 1], ["F3", 1]
];

// ---------- Battle theme (urgent, A harmonic minor, 188 BPM) ----------
// Galloping 16th-note bassline + driving 16th-note lead with a power-chord feel.
const BATTLE_BPM = 188;
const BATTLE_LEAD: [string, number][] = [
  // Bar 1 — climbing A-minor arpeggio at 16ths
  ["A5", 0.25], ["E5", 0.25], ["A5", 0.25], ["C6", 0.25],
  ["E6", 0.25], ["C6", 0.25], ["A5", 0.25], ["E5", 0.25],
  // Bar 2 — G major shape
  ["G5", 0.25], ["D5", 0.25], ["G5", 0.25], ["B5", 0.25],
  ["D6", 0.25], ["B5", 0.25], ["G5", 0.25], ["D5", 0.25],
  // Bar 3 — F major climb to high E
  ["F5", 0.5], ["A5", 0.5], ["C6", 0.5], ["E6", 0.5],
  // Bar 4 — descending tag with leading tone (G#)
  ["A5", 0.25], ["G5", 0.25], ["F5", 0.25], ["E5", 0.25],
  ["D5", 0.25], ["C5", 0.25], ["B4", 0.25], ["A4", 0.25],
  // Bar 5 — repeat call/response higher
  ["E6", 0.25], ["A5", 0.25], ["E6", 0.25], ["A5", 0.25],
  ["E6", 0.25], ["C6", 0.25], ["A5", 0.25], ["E5", 0.25],
  // Bar 6 — D minor
  ["D5", 0.25], ["A4", 0.25], ["D5", 0.25], ["F5", 0.25],
  ["A5", 0.25], ["F5", 0.25], ["D5", 0.25], ["A4", 0.25],
  // Bar 7 — E7 (with G# lead)
  ["E5", 0.25], ["G5", 0.25], ["B5", 0.25], ["E6", 0.25],
  ["G5", 0.25], ["E5", 0.25], ["B4", 0.25], ["A4", 0.25],
  // Bar 8 — final A
  ["A5", 0.5], ["E5", 0.5], ["A5", 1]
];
const BATTLE_BASS: [string, number][] = [
  // Galloping eighth notes alternating low/high — Pokemon battle gallop
  ["A2", 0.5], ["A3", 0.5], ["A2", 0.5], ["A3", 0.5],
  ["G2", 0.5], ["G3", 0.5], ["G2", 0.5], ["G3", 0.5],
  ["F2", 0.5], ["F3", 0.5], ["F2", 0.5], ["F3", 0.5],
  ["E2", 0.5], ["E3", 0.5], ["E2", 0.5], ["E3", 0.5],
  ["A2", 0.5], ["A3", 0.5], ["A2", 0.5], ["A3", 0.5],
  ["D3", 0.5], ["A3", 0.5], ["D3", 0.5], ["A3", 0.5],
  ["E3", 0.5], ["B3", 0.5], ["E3", 0.5], ["G3", 0.5],
  ["A2", 1], ["A2", 1]
];

type MusicMode = "welcome" | "lobby" | "battle";

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private current: MusicMode | null = null;
  private pausedMode: MusicMode | null = null;
  /** YT player that's currently producing audio (or null if synth/silence) */
  private activeYt: YouTubeMusic | null = null;
  /** YT player that was active when we muted; restored on un-mute */
  private pausedYt: YouTubeMusic | null = null;
  private schedulerId: number | null = null;
  private nextLoopAt = 0;
  private muted = false;
  private cryCache = new Map<number, HTMLAudioElement>();

  /**
   * Lazy-create the AudioContext, master gain, and SFX gain.
   * The MUSIC gain is intentionally NOT created here — each music session
   * gets its own fresh GainNode (see startMusic) so we can hard-cut all
   * already-queued oscillators when switching modes, eliminating overlap.
   */
  private ensure() {
    if (this.ctx && this.master && this.sfxGain) {
      return { ctx: this.ctx, master: this.master, sfxGain: this.sfxGain };
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.6;
    master.connect(ctx.destination);
    const sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.45;
    sfxGain.connect(master);
    this.ctx = ctx;
    this.master = master;
    this.sfxGain = sfxGain;
    return { ctx, master, sfxGain };
  }

  async resume() {
    const { ctx } = this.ensure();
    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch { /* ignore */ }
    }
  }

  /**
   * Single source of truth for sound on/off. Synchronizes:
   *   - Synth master gain (instant 0 / 0.6)
   *   - EVERY YT iframe (mute + pause across all 4 sources)
   *   - HTMLAudio cries (pause + reset)
   *   - Synth music scheduler (cleared on mute, restarted on un-mute)
   *
   * After this returns, audibility matches the requested mute state exactly.
   */
  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(m ? 0 : 0.6, t);
    }
    if (m) {
      // Remember what was playing so we can resume on un-mute.
      const wasMode = this.current;
      const wasYt   = this.activeYt;
      // 1) Kill synth scheduler + silence synth music gain.
      if (this.schedulerId !== null) {
        window.clearInterval(this.schedulerId);
        this.schedulerId = null;
      }
      if (this.musicGain && this.ctx) {
        try {
          this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
          this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } catch { /* ignore */ }
      }
      // 2) Mute + pause EVERY YT player.
      allYtPlayers().forEach((p) => { p.setMuted(true); p.pause(); });
      // 3) Pause every cached cry.
      this.cryCache.forEach((a) => {
        try { a.pause(); a.currentTime = 0; } catch { /* ignore */ }
      });
      this.pausedMode = wasMode;
      this.pausedYt   = wasYt;
      this.current    = null;
      this.activeYt   = null;
    } else {
      // Un-mute and resume whichever source was active.
      allYtPlayers().forEach((p) => p.setMuted(false));
      const yt = this.pausedYt;
      const mode = this.pausedMode;
      this.pausedYt = null;
      this.pausedMode = null;
      Promise.resolve().then(() => {
        if (yt) {
          this.activeYt = yt;
          yt.play();
        } else if (mode) {
          this.startMusic(mode);
        }
      });
    }
  }
  isMuted() { return this.muted; }

  // ---------- Music ----------
  /** Welcome theme — synth, plays on the welcome screen */
  playWelcome() { return this.startMusic("welcome"); }

  /** Lobby music — YT track, used between questions and on lobby/setup */
  async playLobby() {
    return this.switchToYt(ytLobby(), "lobby");
  }
  /** Battle music — YT track, used while a question is active */
  async playBattle() {
    return this.switchToYt(ytBattle(), "battle");
  }
  /** Plays the correct-answer YT track during the reveal phase */
  async playCorrectMusic() {
    return this.switchToYt(ytCorrect(), null);
  }
  /** Plays the winner YT track on the results stage */
  async playWinnerMusic() {
    return this.switchToYt(ytWinner(), null);
  }

  /**
   * Switch to a specific YT track. Pauses every other YT player and silences
   * the synth music gain — only ONE music source ever produces audio.
   *
   * @param yt          target YT player
   * @param synthFallback synth mode to use if the YT player has failed (or null
   *                      to just play silence). Welcome / lobby / battle all
   *                      have synth equivalents.
   */
  private async switchToYt(yt: YouTubeMusic, synthFallback: MusicMode | null) {
    if (this.muted) {
      this.pausedYt = yt;
      this.pausedMode = synthFallback;
      return;
    }
    // Tear down any synth music session
    this.stopSynthMusic();
    // Pause every OTHER YT player so only this one is producing audio
    allYtPlayers().forEach((p) => { if (p !== yt) p.pause(); });
    this.activeYt = yt;
    yt.setMuted(false);
    const ok = await yt.play();
    if (!ok || yt.hasFailed()) {
      // YT failed — fall back to synth if a fallback exists, otherwise silence.
      this.activeYt = null;
      if (synthFallback) {
        await this.startMusic(synthFallback);
      }
    }
  }

  /** Stops only the synth music session (gain, scheduler, look-ahead). */
  private stopSynthMusic() {
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    if (this.musicGain && this.ctx) {
      const t = this.ctx.currentTime;
      const oldGain = this.musicGain;
      this.musicGain = null;
      try {
        oldGain.gain.cancelScheduledValues(t);
        oldGain.gain.setValueAtTime(0, t);
      } catch { /* ignore */ }
      setTimeout(() => { try { oldGain.disconnect(); } catch { /* ignore */ } }, 200);
    }
    this.current = null;
  }

  /** Full stop — silences synth AND every YT player. */
  stopMusic() {
    this.stopSynthMusic();
    allYtPlayers().forEach((p) => p.pause());
    this.activeYt = null;
  }

  private async startMusic(mode: MusicMode) {
    if (this.muted) {
      // Remember intent so we resume the right mode on un-mute.
      this.pausedMode = mode;
      return;
    }
    if (this.current === mode) return;
    this.stopMusic(); // tears down the previous session's gain node
    const { ctx, master } = this.ensure();
    if (ctx.state === "suspended") return; // needs user gesture
    // Fresh per-session music gain. Notes scheduled in this session connect
    // here; when stopMusic runs again, we'll cut THIS gain to 0.
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.04);
    this.musicGain = gain;
    this.current = mode;
    this.nextLoopAt = ctx.currentTime + 0.05;
    this.scheduleAhead();
    this.schedulerId = window.setInterval(() => this.scheduleAhead(), 400);
  }

  private scheduleAhead() {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const musicGain = this.musicGain;
    if (this.current === null) return;
    const mode = this.current;
    const cfg = this.modeConfig(mode);
    const beatDur = 60 / cfg.bpm;
    const loopBeats = cfg.lead.reduce((s, [, b]) => s + b, 0);
    const loopDur = loopBeats * beatDur;
    while (this.nextLoopAt < ctx.currentTime + 1.5) {
      if (this.current !== mode || this.musicGain !== musicGain) return;
      this.scheduleLoop(ctx, musicGain, this.nextLoopAt, cfg.lead, cfg.bass, beatDur, mode);
      this.nextLoopAt += loopDur;
    }
  }

  private modeConfig(mode: MusicMode) {
    if (mode === "welcome") return { lead: WELCOME_LEAD, bass: WELCOME_BASS, bpm: WELCOME_BPM };
    if (mode === "lobby")   return { lead: LOBBY_LEAD,   bass: LOBBY_BASS,   bpm: LOBBY_BPM };
    return                       { lead: BATTLE_LEAD,  bass: BATTLE_BASS,  bpm: BATTLE_BPM };
  }

  private scheduleLoop(
    ctx: AudioContext, out: GainNode, startAt: number,
    lead: [string, number][], bass: [string, number][],
    beatDur: number, mode: MusicMode
  ) {
    const leadType: OscillatorType = "square";
    const bassType: OscillatorType = "triangle";
    const leadPeak = mode === "battle" ? 0.28 : mode === "welcome" ? 0.2 : 0.24;
    const bassPeak = mode === "battle" ? 0.36 : mode === "welcome" ? 0.26 : 0.32;

    let t = startAt;
    for (const [name, beats] of lead) {
      const dur = beats * beatDur;
      if (name !== "rest") this.tone(ctx, out, NOTE[name], t, dur * 0.92, leadType, leadPeak);
      t += dur;
    }
    t = startAt;
    for (const [name, beats] of bass) {
      const dur = beats * beatDur;
      if (name !== "rest") this.tone(ctx, out, NOTE[name], t, dur * 0.95, bassType, bassPeak);
      t += dur;
    }
  }

  private tone(
    ctx: AudioContext, out: GainNode, freq: number,
    start: number, dur: number, type: OscillatorType, peak: number
  ) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(peak, start + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(env).connect(out);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  // ---------- Cries (PokeAPI) ----------
  async playCry(id: number, volume = 0.7) {
    if (typeof window === "undefined") return;
    if (this.muted) return; // hard-skip when muted
    let audio = this.cryCache.get(id);
    if (!audio) {
      audio = new Audio(`${CRY_BASE}/${id}.ogg`);
      audio.preload = "auto";
      this.cryCache.set(id, audio);
    }
    audio.volume = volume;
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch { /* ignore */ }
  }

  /** Pikachu — happy correct-answer cry */
  playCorrect() { return this.playCry(25, 0.85); }
  /** Wobbuffet — sad wrong-answer cry */
  playWrong()   { return this.playCry(202, 0.85); }

  preload(ids: number[]) {
    for (const id of ids) {
      if (this.cryCache.has(id)) continue;
      const a = new Audio(`${CRY_BASE}/${id}.ogg`);
      a.preload = "auto";
      this.cryCache.set(id, a);
    }
  }

  // ---------- Synthesized UI SFX ----------
  /** Pokeball click — quick descending blip */
  playClick() {
    const { ctx, sfxGain } = this.ensure();
    if (ctx.state === "suspended") return;
    const t0 = ctx.currentTime;
    this.tone(ctx, sfxGain, 880, t0, 0.06, "square", 0.3);
    this.tone(ctx, sfxGain, 660, t0 + 0.05, 0.08, "square", 0.3);
  }

  /** Subtle hover beep */
  playHover() {
    const { ctx, sfxGain } = this.ensure();
    if (ctx.state === "suspended") return;
    this.tone(ctx, sfxGain, 1200, ctx.currentTime, 0.04, "sine", 0.18);
  }

  /** Timer warning — tense ticks */
  playWarning() {
    const { ctx, sfxGain } = this.ensure();
    if (ctx.state === "suspended") return;
    const t0 = ctx.currentTime;
    this.tone(ctx, sfxGain, 880, t0, 0.08, "square", 0.35);
    this.tone(ctx, sfxGain, 880, t0 + 0.18, 0.08, "square", 0.35);
  }

  /** Whoosh between turns */
  playWhoosh() {
    const { ctx, sfxGain } = this.ensure();
    if (ctx.state === "suspended") return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 600;
    filter.Q.value = 0.6;
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.connect(filter).connect(env).connect(sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  }

  /** Heroic battle-start fanfare */
  playFanfare() {
    const { ctx, sfxGain } = this.ensure();
    if (this.muted || ctx.state === "suspended") return;
    const t0 = ctx.currentTime;
    this.tone(ctx, sfxGain, NOTE.C5, t0,        0.12, "square", 0.34);
    this.tone(ctx, sfxGain, NOTE.E5, t0 + 0.12, 0.12, "square", 0.34);
    this.tone(ctx, sfxGain, NOTE.G5, t0 + 0.24, 0.12, "square", 0.34);
    this.tone(ctx, sfxGain, NOTE.C6, t0 + 0.36, 0.34, "square", 0.36);
    this.tone(ctx, sfxGain, NOTE.C3, t0,        0.7,  "triangle", 0.34);
    this.tone(ctx, sfxGain, NOTE.G3, t0 + 0.36, 0.34, "triangle", 0.34);
  }

  /**
   * Victory jingle — plays after a correct answer.
   * Triumphant ascending C-major fanfare with a held high note ("ta-da-DA-DA").
   */
  playVictory() {
    const { ctx, sfxGain } = this.ensure();
    if (this.muted || ctx.state === "suspended") return;
    const t0 = ctx.currentTime;
    // Lead — square wave, climbing arpeggio with a hold
    const lead: [number, number, number][] = [
      // [freq, offset, duration]
      [NOTE.G5,  0.00, 0.10],
      [NOTE.C6,  0.10, 0.10],
      [NOTE.E6,  0.20, 0.10],
      [NOTE.G6,  0.30, 0.30],
      [NOTE.E6,  0.62, 0.10],
      [NOTE.G6,  0.74, 0.55]
    ];
    for (const [f, off, dur] of lead) {
      this.tone(ctx, sfxGain, f, t0 + off, dur, "square", 0.42);
    }
    // Harmony layer — softer, perfect-fifth/third intervals
    const harmony: [number, number, number][] = [
      [NOTE.E5, 0.00, 0.10],
      [NOTE.G5, 0.10, 0.10],
      [NOTE.C6, 0.20, 0.10],
      [NOTE.E6, 0.30, 0.30],
      [NOTE.C6, 0.62, 0.10],
      [NOTE.E6, 0.74, 0.55]
    ];
    for (const [f, off, dur] of harmony) {
      this.tone(ctx, sfxGain, f, t0 + off, dur, "square", 0.22);
    }
    // Bass — triangle, rooting the cadence
    this.tone(ctx, sfxGain, NOTE.C3, t0,        0.6,  "triangle", 0.36);
    this.tone(ctx, sfxGain, NOTE.G3, t0 + 0.30, 0.30, "triangle", 0.34);
    this.tone(ctx, sfxGain, NOTE.C3, t0 + 0.74, 0.55, "triangle", 0.4);
    this.tone(ctx, sfxGain, NOTE.C4, t0 + 0.74, 0.55, "triangle", 0.32);
  }

  /**
   * Defeat jingle — plays after a wrong answer or timeout.
   * Short descending sting with a sad minor cadence.
   */
  playDefeat() {
    const { ctx, sfxGain } = this.ensure();
    if (this.muted || ctx.state === "suspended") return;
    const t0 = ctx.currentTime;
    const lead: [number, number, number][] = [
      [NOTE.E5, 0.00, 0.18],
      [NOTE.D5, 0.16, 0.18],
      [NOTE.C5, 0.32, 0.18],
      [NOTE.B4, 0.48, 0.18],
      [NOTE.A4, 0.64, 0.55]
    ];
    for (const [f, off, dur] of lead) {
      this.tone(ctx, sfxGain, f, t0 + off, dur, "square", 0.32);
    }
    // Bass — A minor "drop"
    this.tone(ctx, sfxGain, NOTE.A2, t0,        0.65, "triangle", 0.36);
    this.tone(ctx, sfxGain, NOTE.A2, t0 + 0.64, 0.55, "triangle", 0.4);
    this.tone(ctx, sfxGain, NOTE.E3, t0 + 0.64, 0.55, "triangle", 0.3);
  }
}

let singleton: AudioManager | null = null;
export function audio(): AudioManager {
  if (!singleton) singleton = new AudioManager();
  return singleton;
}
