"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";

import styles from "./AudioController.module.css";

export type AudioControllerHandle = { playFromGesture: () => void };

type AudioControllerProps = {
  enabled: boolean;
  src: string;
};

export const AudioController = forwardRef<AudioControllerHandle, AudioControllerProps>(
  function AudioController({ enabled, src }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const fadeFrameRef = useRef<number | null>(null);
    const [playing, setPlaying] = useState(false);
    const [unavailable, setUnavailable] = useState(false);

    function stopFade() {
      if (fadeFrameRef.current !== null) cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }

    function fadeIn(audio: HTMLAudioElement) {
      stopFade();
      const start = performance.now();
      const duration = 1800;
      audio.volume = 0;

      function tick(now: number) {
        const progress = Math.min(1, (now - start) / duration);
        audio.volume = Math.min(0.68, progress * 0.68);
        if (progress < 1) fadeFrameRef.current = requestAnimationFrame(tick);
        else fadeFrameRef.current = null;
      }

      fadeFrameRef.current = requestAnimationFrame(tick);
    }

    async function play() {
      const audio = audioRef.current;
      if (!enabled || !audio || unavailable) return;
      try {
        await audio.play();
        fadeIn(audio);
        setPlaying(true);
      } catch {
        setUnavailable(true);
        setPlaying(false);
      }
    }

    useImperativeHandle(ref, () => ({ playFromGesture: () => { void play(); } }));

    useEffect(() => {
      const handleVisibility = () => {
        if (document.hidden && audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setPlaying(false);
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        stopFade();
      };
    }, []);

    async function togglePlayback() {
      const audio = audioRef.current;
      if (!audio) return;
      if (playing) {
        stopFade();
        audio.pause();
        setPlaying(false);
      } else {
        await play();
      }
    }

    const disabled = !enabled || unavailable;
    const stateLabel = !enabled
      ? "Música ainda não disponível"
      : unavailable
        ? "Não foi possível carregar a música"
        : playing
          ? "Pausar música"
          : "Reproduzir música";

    return (
      <div className={styles.audioControl}>
        {enabled ? (
          <audio onError={() => setUnavailable(true)} preload="none" ref={audioRef} src={src} />
        ) : null}
        <button
          aria-label={stateLabel}
          className={styles.audioButton}
          disabled={disabled}
          onClick={() => void togglePlayback()}
          title={stateLabel}
          type="button"
        >
          <Icon name={playing ? "pause" : "music"} size={19} />
          <span aria-hidden="true" className={playing ? styles.equalizerActive : styles.equalizer}>
            <i /><i /><i />
          </span>
        </button>
        <span className="sr-only" aria-live="polite">{stateLabel}</span>
      </div>
    );
  },
);
