"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";

import styles from "./AudioController.module.css";

export type AudioControllerHandle = { playFromGesture: () => void };

type AudioControllerProps = {
  enabled: boolean;
  spotifyUrl: string;
  title: string;
};

export const AudioController = forwardRef<AudioControllerHandle, AudioControllerProps>(
  function AudioController({ enabled, spotifyUrl, title }, ref) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const available = enabled && Boolean(spotifyUrl);

    useImperativeHandle(ref, () => ({ playFromGesture: () => undefined }));

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
          <Icon name={open ? "pause" : "music"} size={19} />
        </button>
        {open ? (
          <div aria-label={title} className={styles.spotifyPanel} role="dialog">
            <div className={styles.spotifyHeader}>
              <p>{title}</p>
              <button aria-label="Fechar player de música" onClick={() => setOpen(false)} ref={closeButtonRef} type="button">
                <Icon name="close" size={17} />
              </button>
            </div>
            <iframe
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              src={spotifyUrl}
              title={title}
            />
          </div>
        ) : null}
        <span className="sr-only" aria-live="polite">{stateLabel}</span>
      </div>
    );
  },
);
