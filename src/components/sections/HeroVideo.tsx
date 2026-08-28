"use client";

import { useEffect, useState } from "react";

import styles from "./EditorialSections.module.css";

const HERO_DESKTOP_MEDIA = "(orientation: landscape), (min-aspect-ratio: 1/1)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";

type HeroVideoProps = {
  desktopPoster: string;
  desktopSrc: string;
  mobilePoster: string;
  mobileSrc: string;
};

export function HeroVideo({ desktopPoster, desktopSrc, mobilePoster, mobileSrc }: HeroVideoProps) {
  const [video, setVideo] = useState<{ poster: string; src: string } | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia(HERO_DESKTOP_MEDIA);
    const motionQuery = window.matchMedia(REDUCED_MOTION_MEDIA);

    const updateVideoState = () => {
      if (motionQuery.matches) {
        setVideo(null);
        setIsReady(false);
        return;
      }

      setVideo(desktopQuery.matches ? { poster: desktopPoster, src: desktopSrc } : { poster: mobilePoster, src: mobileSrc });
      setIsReady(false);
    };

    updateVideoState();
    desktopQuery.addEventListener("change", updateVideoState);
    motionQuery.addEventListener("change", updateVideoState);

    return () => {
      desktopQuery.removeEventListener("change", updateVideoState);
      motionQuery.removeEventListener("change", updateVideoState);
    };
  }, [desktopPoster, desktopSrc, mobilePoster, mobileSrc]);

  return (
    <video
      aria-hidden="true"
      autoPlay
      className={[styles.heroVideo, isReady ? styles.heroVideoReady : ""].join(" ")}
      loop
      muted
      playsInline
      poster={video?.poster}
      preload="metadata"
      src={video?.src}
      tabIndex={-1}
      onCanPlay={() => setIsReady(true)}
    />
  );
}
