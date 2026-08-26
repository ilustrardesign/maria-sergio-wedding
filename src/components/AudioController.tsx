"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";

import styles from "./AudioController.module.css";

export type AudioControllerHandle = {
  pause: () => void;
  playFromGesture: () => void;
  restart: () => void;
  resume: () => void;
  togglePlay: () => void;
};

type AudioControllerProps = {
  enabled: boolean;
  spotifyUri: string;
  spotifyUrl: string;
  title: string;
};

type SpotifyPlaybackUpdate = {
  data?: {
    duration?: number;
    isBuffering?: boolean;
    isPaused?: boolean;
    position?: number;
  };
};

type SpotifyEmbedController = {
  addListener: (event: "ready" | "playback_update", listener: (event: SpotifyPlaybackUpdate) => void) => void;
  destroy?: () => void;
  pause: () => void;
  play: () => void;
  restart: () => void;
  resume: () => void;
  togglePlay: () => void;
};

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { height: string; uri?: string; url?: string; width: string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let spotifyApi: SpotifyIframeApi | null = null;
let spotifyApiPromise: Promise<SpotifyIframeApi> | null = null;

export function __resetSpotifyIframeApiForTests() {
  spotifyApi = null;
  spotifyApiPromise = null;
}

function loadSpotifyIframeApi() {
  if (spotifyApi) return Promise.resolve(spotifyApi);
  if (spotifyApiPromise) return spotifyApiPromise;

  spotifyApiPromise = new Promise((resolve) => {
    const previousCallback = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api: SpotifyIframeApi) => {
      previousCallback?.(api);
      spotifyApi = api;
      resolve(api);
    };

    if (document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    document.body.appendChild(script);
  });

  return spotifyApiPromise;
}

export const AudioController = forwardRef<AudioControllerHandle, AudioControllerProps>(
  function AudioController({ enabled, spotifyUri, spotifyUrl, title }, ref) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const embedRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<SpotifyEmbedController | null>(null);
    const loopRestartingRef = useRef(false);
    const previewDetectedRef = useRef(false);
    const pendingGesturePlayRef = useRef(false);
    const playbackIntentRef = useRef(false);
    const loopTimeoutRef = useRef<number | null>(null);
    const isPlayingRef = useRef(false);
    const lastPlayingRef = useRef(false);
    const hoverOpenTimeoutRef = useRef<number | null>(null);
    const hoverCloseTimeoutRef = useRef<number | null>(null);
    const [open, setOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const available = enabled && Boolean(spotifyUri || spotifyUrl);

    const requestPlay = useCallback(() => {
      playbackIntentRef.current = true;
      isPlayingRef.current = true;
      setIsPlaying(true);
      const controller = controllerRef.current;
      if (!controller) {
        pendingGesturePlayRef.current = true;
        return;
      }

      try {
        controller.play();
      } catch {
        pendingGesturePlayRef.current = false;
      }
    }, []);

    const callController = useCallback((method: "pause" | "restart" | "resume" | "togglePlay") => {
      if (method === "pause") playbackIntentRef.current = false;
      if (method === "resume") playbackIntentRef.current = true;
      if (method === "togglePlay") playbackIntentRef.current = !playbackIntentRef.current;
      if (method === "pause") { isPlayingRef.current = false; setIsPlaying(false); }
      if (method === "resume" || method === "restart") { isPlayingRef.current = true; setIsPlaying(true); }
      if (method === "togglePlay") { isPlayingRef.current = playbackIntentRef.current; setIsPlaying(playbackIntentRef.current); }
      try {
        controllerRef.current?.[method]();
      } catch {
        isPlayingRef.current = false;
        setIsPlaying(false);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      pause: () => callController("pause"),
      playFromGesture: requestPlay,
      restart: () => callController("restart"),
      resume: () => callController("resume"),
      togglePlay: () => callController("togglePlay"),
    }));

    useEffect(() => {
      if (!available || !embedRef.current || controllerRef.current) return;
      let destroyed = false;

      loadSpotifyIframeApi().then((api) => {
        if (destroyed || !embedRef.current || controllerRef.current) return;
        api.createController(
          embedRef.current,
          { height: "152", uri: spotifyUri || undefined, url: spotifyUri ? undefined : spotifyUrl, width: "100%" },
          (controller) => {
            if (destroyed) {
              controller.destroy?.();
              return;
            }

            controllerRef.current = controller;
            controller.addListener("ready", () => {
              if (pendingGesturePlayRef.current) {
                pendingGesturePlayRef.current = false;
                requestPlay();
              }
            });
            controller.addListener("playback_update", (event) => {
              const duration = event.data?.duration ?? 0;
              const isBuffering = Boolean(event.data?.isBuffering);
              const isPaused = Boolean(event.data?.isPaused);
              const position = event.data?.position ?? 0;
              const playing = !isPaused && !isBuffering;
              if (isPaused && lastPlayingRef.current && !loopRestartingRef.current) playbackIntentRef.current = false;
              lastPlayingRef.current = playing;
              isPlayingRef.current = playing;
              setIsPlaying(playing);

              if (duration <= 0) return;
              if (duration < 60000) {
                previewDetectedRef.current = true;
              } else {
                previewDetectedRef.current = false;
              }

              const remaining = duration - position;
              const nearEnd = playing && position > duration * 0.92 && remaining <= (previewDetectedRef.current ? 700 : 350);
              if (nearEnd && playbackIntentRef.current && !loopRestartingRef.current) {
                loopRestartingRef.current = true;
                try {
                  controller.restart();
                  loopTimeoutRef.current = window.setTimeout(() => {
                    loopTimeoutRef.current = null;
                    if (!playbackIntentRef.current) {
                      loopRestartingRef.current = false;
                      return;
                    }
                    try {
                      controller.resume();
                    } catch {
                      setIsPlaying(false);
                    } finally {
                      loopRestartingRef.current = false;
                    }
                  }, 220);
                } catch {
                  loopRestartingRef.current = false;
                }
              } else if (!nearEnd && remaining > 2500) {
                loopRestartingRef.current = false;
              }
            });
          },
        );
      });

      return () => {
        destroyed = true;
        controllerRef.current?.destroy?.();
        controllerRef.current = null;
        if (loopTimeoutRef.current) window.clearTimeout(loopTimeoutRef.current);
        loopTimeoutRef.current = null;
        playbackIntentRef.current = false;
        isPlayingRef.current = false;
        lastPlayingRef.current = false;
      };
    }, [available, requestPlay, spotifyUri, spotifyUrl]);

    useEffect(() => {
      if (!open) return;
      const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        window.cancelAnimationFrame(frame);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open]);

    useEffect(() => () => {
      if (hoverOpenTimeoutRef.current) window.clearTimeout(hoverOpenTimeoutRef.current);
      if (hoverCloseTimeoutRef.current) window.clearTimeout(hoverCloseTimeoutRef.current);
    }, []);

    if (!available) return null;

    const stateLabel = isPlaying ? "Pausar música" : "Reproduzir música";
    const panelClassName = [styles.spotifyPanel, open ? styles.spotifyPanelOpen : ""].filter(Boolean).join(" ");
    const revealPlayer = () => {
      if (!window.matchMedia("(min-width: 49rem)").matches) return;
      if (hoverCloseTimeoutRef.current) window.clearTimeout(hoverCloseTimeoutRef.current);
      if (hoverOpenTimeoutRef.current) window.clearTimeout(hoverOpenTimeoutRef.current);
      hoverOpenTimeoutRef.current = window.setTimeout(() => setOpen(true), 190);
    };
    const concealPlayer = () => {
      if (hoverOpenTimeoutRef.current) window.clearTimeout(hoverOpenTimeoutRef.current);
      if (hoverCloseTimeoutRef.current) window.clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = window.setTimeout(() => setOpen(false), 180);
    };
    const togglePlayback = () => {
      if (isPlayingRef.current) callController("pause");
      else if (controllerRef.current) callController("resume");
      else requestPlay();
    };

    return (
      <div className={styles.audioControl} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) concealPlayer(); }} onFocus={revealPlayer} onMouseEnter={revealPlayer} onMouseLeave={concealPlayer}>
        <button
          aria-pressed={isPlaying}
          aria-label={stateLabel}
          className={styles.audioButton}
          onClick={togglePlayback}
          title={stateLabel}
          type="button"
        >
          <Icon name={isPlaying ? "pause" : "music"} size={19} />
        </button>
        <button aria-label="Abrir player completo" className={styles.playerButton} onClick={() => setOpen(true)} type="button"><span aria-hidden="true">⌄</span></button>
        <div aria-hidden={!open} aria-label={title} className={panelClassName} onMouseEnter={revealPlayer} onMouseLeave={concealPlayer} role="dialog">
          <div className={styles.spotifyHeader}>
            <p>{title}</p>
            <button aria-label="Fechar player de música" onClick={() => setOpen(false)} ref={closeButtonRef} tabIndex={open ? 0 : -1} type="button">
              <Icon name="close" size={17} />
            </button>
          </div>
          <div className={styles.spotifyEmbed} ref={embedRef} />
        </div>
        <span className="sr-only" aria-live="polite">{stateLabel}</span>
      </div>
    );
  },
);
