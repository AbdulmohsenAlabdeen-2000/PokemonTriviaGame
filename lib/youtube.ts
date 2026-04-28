/**
 * Hidden YouTube IFrame players used as music/audio sources.
 *
 * Multiple players can coexist (one per video) — see the named registry at
 * the bottom (`ytPlayer(name, videoId)`). The audio manager is responsible
 * for pausing the others before starting a new one.
 *
 * Caveats the embed pattern can't avoid:
 *   - Ads may play depending on the uploader's monetization
 *   - If a video has embedding disabled, onError fires (code 101 / 150) and
 *     hasFailed() returns true. Callers should fall back gracefully.
 */

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (s: number, allowSeekAhead?: boolean) => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (v: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        target: string | HTMLElement,
        opts: Record<string, unknown>
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number; UNSTARTED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadApi(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    if (window.YT && window.YT.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
    if (!document.getElementById("yt-iframe-api-script")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api-script";
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return apiPromise;
}

export class YouTubeMusic {
  private videoId: string;
  private slug: string; // unique slug for the host element
  private player: YTPlayer | null = null;
  private ready = false;
  private failed = false;
  private wantPlay = false;
  private wantMuted = false;
  private initPromise: Promise<void> | null = null;

  constructor(videoId: string, slug: string) {
    this.videoId = videoId;
    this.slug = slug;
  }

  isReady() { return this.ready && !this.failed; }
  hasFailed() { return this.failed; }

  async init(): Promise<void> {
    if (typeof window === "undefined") return;
    if (this.player || this.failed) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      await loadApi();
      await this.createPlayer();
    })();
    return this.initPromise;
  }

  private createPlayer(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!window.YT || !window.YT.Player) {
        this.failed = true;
        resolve();
        return;
      }
      const hostId = `yt-host-${this.slug}`;
      const targetId = `yt-target-${this.slug}`;
      let host = document.getElementById(hostId);
      if (!host) {
        host = document.createElement("div");
        host.id = hostId;
        host.style.cssText =
          "position:fixed; left:-99999px; top:-99999px; width:1px; height:1px; overflow:hidden; pointer-events:none;";
        document.body.appendChild(host);
        const inner = document.createElement("div");
        inner.id = targetId;
        host.appendChild(inner);
      }
      const timeoutId = window.setTimeout(() => {
        if (!this.ready) {
          this.failed = true;
          resolve();
        }
      }, 6000);
      this.player = new window.YT.Player(targetId, {
        videoId: this.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          loop: 1,
          playlist: this.videoId,
          modestbranding: 1,
          fs: 0,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1
        },
        events: {
          onReady: () => {
            window.clearTimeout(timeoutId);
            this.ready = true;
            try { this.player!.setVolume(70); } catch { /* ignore */ }
            if (this.wantMuted) {
              try { this.player!.mute(); } catch { /* ignore */ }
            }
            if (this.wantPlay) {
              this.wantPlay = false;
              try {
                this.player!.seekTo(0, true);
                this.player!.playVideo();
              } catch { /* ignore */ }
            }
            resolve();
          },
          onError: () => {
            window.clearTimeout(timeoutId);
            this.failed = true;
            resolve();
          }
        }
      });
    });
  }

  async play(): Promise<boolean> {
    await this.init();
    if (this.failed || !this.player) return false;
    if (!this.ready) {
      this.wantPlay = true;
      return true;
    }
    try {
      this.player.seekTo(0, true);
      this.player.playVideo();
    } catch { /* ignore */ }
    return true;
  }

  pause() {
    this.wantPlay = false;
    if (!this.ready || !this.player) return;
    try { this.player.pauseVideo(); } catch { /* ignore */ }
  }

  stop() {
    this.wantPlay = false;
    if (!this.ready || !this.player) return;
    try {
      this.player.pauseVideo();
      this.player.seekTo(0, true);
    } catch { /* ignore */ }
  }

  setMuted(m: boolean) {
    this.wantMuted = m;
    if (!this.ready || !this.player) return;
    try { m ? this.player.mute() : this.player.unMute(); } catch { /* ignore */ }
  }
}

// ----- Named registry --------------------------------------------------

const REGISTRY = new Map<string, YouTubeMusic>();

export function ytPlayer(name: string, videoId: string): YouTubeMusic {
  const key = `${name}:${videoId}`;
  if (!REGISTRY.has(key)) {
    REGISTRY.set(key, new YouTubeMusic(videoId, name));
  }
  return REGISTRY.get(key)!;
}

export function allYtPlayers(): YouTubeMusic[] {
  return Array.from(REGISTRY.values());
}

// ----- Track IDs (single source of truth) ------------------------------

export const VIDEO_LOBBY   = "l490gxtJMW4";
export const VIDEO_BATTLE  = "PfDhKzpUieA";
export const VIDEO_CORRECT = "zhCXcOGhy4c";
export const VIDEO_WINNER  = "nyINomMu61E";
