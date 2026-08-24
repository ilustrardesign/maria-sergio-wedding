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
    const [open, setOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const available = enabled && Boolean(spotifyUri || spotifyUrl);

    const requestPlay = useCallback(() => {
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
      try {
        controllerRef.current?.[method]();
      } catch {
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
              setIsPlaying(playing);

              if (duration <= 0) return;
              if (duration < 60000) {
                previewDetectedRef.current = true;
                loopRestartingRef.current = false;
                return;
              }

              previewDetectedRef.current = false;
              const remaining = duration - position;
              const nearEnd = playing && position > duration * 0.92 && remaining <= 1500;
              if (nearEnd && !loopRestartingRef.current && !previewDetectedRef.current) {
                loopRestartingRef.current = true;
                try {
                  controller.restart();
                  window.setTimeout(() => {
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

    if (!available) return null;

    const stateLabel = open ? "Fechar player de música" : "Abrir player de música";
    const panelClassName = [styles.spotifyPanel, open ? styles.spotifyPanelOpen : ""].filter(Boolean).join(" ");

    return (
      <div className={styles.audioControl}>
        <button
          aria-expanded={open}
          aria-label={stateLabel}
          className={styles.audioButton}
          onClick={() => setOpen((current) => !current)}
          title={stateLabel}
          type="button"
        >
          <Icon name={isPlaying ? "pause" : "music"} size={19} />
        </button>
        <div aria-hidden={!open} aria-label={title} className={panelClassName} role="dialog">
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
