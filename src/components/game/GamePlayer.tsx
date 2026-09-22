"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { Game } from "@/src/types/game";
import styles from "@/src/style/site.module.css";

type State = "unconfigured" | "ready" | "loading" | "loaded" | "timed-out" | "failed";

function safeHttps(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" ? value : null; } catch { return null; }
}

export function WebpageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1"/><path d="M9 10 6.5 7.5M6.5 7.5V11M6.5 7.5H10M15 14l2.5 2.5M17.5 16.5V13M17.5 16.5H14"/></svg>;
}

export function BrowserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>;
}

export function GamePlayer({ game, preview = false }: { game: Game; preview?: boolean }) {
  const initial: State = game.player.iframeSrc ? "ready" : "unconfigured";
  const [state, setState] = useState<State>(initial);
  const [attempt, setAttempt] = useState(0);
  const [pageFullscreen, setPageFullscreen] = useState(false);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const [message, setMessage] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webpageButtonRef = useRef<HTMLButtonElement>(null);
  const browserButtonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = null; };
  useEffect(() => () => clearTimer(), []);
  useEffect(() => {
    const sync = () => setBrowserFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    if (!pageFullscreen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setPageFullscreen(false); webpageButtonRef.current?.focus(); } };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener("keydown", escape); };
  }, [pageFullscreen]);

  function start() {
    clearTimer();
    const src = safeHttps(game.player.iframeSrc);
    if (!src) { setState("failed"); setMessage("The game could not be opened safely here."); return; }
    setMessage(""); setAttempt((value) => value + 1); setState("loading");
    timerRef.current = setTimeout(() => { setState("timed-out"); setMessage("The game took too long to respond. You can retry safely."); }, game.player.loadTimeoutMs);
  }

  async function toggleBrowserFullscreen() {
    setMessage("");
    try {
      if (pageFullscreen) setPageFullscreen(false);
      if (document.fullscreenElement) await document.exitFullscreen(); else await rootRef.current?.requestFullscreen();
    } catch { setMessage("Fullscreen was not available. Keep playing in the page."); browserButtonRef.current?.focus(); }
  }

  function togglePageFullscreen() {
    setMessage("");
    if (document.fullscreenElement) void document.exitFullscreen();
    setPageFullscreen((value) => !value);
  }

  const status = state === "ready" ? "Ready to play" : state === "loading" ? `Loading ${game.title}…` : state === "loaded" ? "Game loaded. Click inside the game if controls need focus." : state === "unconfigured" ? "This game is not ready to start here." : message;
  const showCover = state === "ready" || state === "loading" || state === "failed" || state === "timed-out";
  return <div ref={rootRef} className={`${styles.player} ${pageFullscreen ? styles.pageFullscreen : ""}`} data-player-state={state} aria-busy={state === "loading"}>
    <div className={styles.playerViewport} style={{ aspectRatio: game.player.aspectRatio ?? "16 / 9" }}>
      {showCover && (game.image.src ? <Image src={game.image.src} alt={game.image.alt} width={game.image.width ?? 1280} height={game.image.height ?? 720} loading="eager" fetchPriority="high" sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 376px), 990px" className={styles.playerCover}/> : preview ? <div className={styles.previewCover} aria-label="Draft cover not yet adopted"><span>{game.title}</span><small>Draft media preview</small></div> : null)}
      {state === "ready" && <button className={styles.playButton} type="button" onClick={start}><span className={styles.playGlyph} aria-hidden="true"/>Play Now</button>}
      {(state === "loading" || state === "loaded") && <iframe key={attempt} data-game-frame src={game.player.iframeSrc} title={`${game.title} game`} allow={game.player.permissionsPolicy.join("; ") || undefined} referrerPolicy={game.player.referrerPolicy ?? undefined} sandbox={game.player.sandbox?.join(" ")} onLoad={() => { clearTimer(); setState("loaded"); rootRef.current?.focus({ preventScroll: true }); }} />}
      {(state === "timed-out" || state === "failed") && <div className={styles.playerFailure} role="alert"><strong>{state === "timed-out" ? "Loading timed out" : "Unable to start"}</strong><p>{message}</p><button type="button" onClick={start}>Retry</button></div>}
      {state === "loading" && <div className={styles.loadingLine} aria-hidden="true"/>}
    </div>
    <div className={styles.playerStatus} tabIndex={-1} id={id}>
      <div><strong>{game.title}</strong><span role="status" aria-live="polite">{status}</span></div>
      <div className={styles.fullscreenControls}>
        <button ref={webpageButtonRef} type="button" aria-label={`${pageFullscreen ? "Exit" : "Enter"} Webpage Fullscreen`} title="Webpage Fullscreen" aria-pressed={pageFullscreen} onClick={togglePageFullscreen}><WebpageIcon /></button>
        <button ref={browserButtonRef} type="button" aria-label={`${browserFullscreen ? "Exit" : "Enter"} Browser Fullscreen`} title="Browser Fullscreen" aria-pressed={browserFullscreen} onClick={() => void toggleBrowserFullscreen()}><BrowserIcon /></button>
      </div>
    </div>
  </div>;
}
