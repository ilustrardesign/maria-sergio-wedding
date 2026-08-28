"use client";

import type { WeddingContent } from "@/types/wedding";
import type { MouseEvent } from "react";
import { heroImages } from "@/generated/hero-images";

import styles from "./EditorialSections.module.css";
import { HeroVideo } from "./HeroVideo";

type HeroSectionProps = { content: WeddingContent };

export function HeroSection({ content }: HeroSectionProps) {
  const desktop = heroImages.desktop;
  const mobile = heroImages.mobile;

  function scrollToCountdown(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const header = document.querySelector<HTMLElement>("header");
    const countdown = document.getElementById("data");
    if (!header || !countdown) return;

    const targetTop = countdown.getBoundingClientRect().top + window.scrollY;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastScrollY = -1;
    let stillFrames = 0;
    let frames = 0;

    const alignToHeader = (behavior: ScrollBehavior) => {
      const currentHeader = document.querySelector<HTMLElement>("header");
      const currentCountdown = document.getElementById("data");
      if (!currentHeader || !currentCountdown) return;
      const exactTop = currentCountdown.getBoundingClientRect().top + window.scrollY - currentHeader.getBoundingClientRect().height;
      window.scrollTo({ top: exactTop, behavior });
    };

    const settle = () => {
      frames += 1;
      if (Math.abs(window.scrollY - lastScrollY) < 0.5) stillFrames += 1;
      else stillFrames = 0;
      lastScrollY = window.scrollY;

      if (reducedMotion || stillFrames >= 12 || frames >= 120) {
        alignToHeader("auto");
        return;
      }
      window.requestAnimationFrame(settle);
    };

    window.scrollTo({ top: targetTop - header.getBoundingClientRect().height, behavior: reducedMotion ? "auto" : "smooth" });
    window.requestAnimationFrame(settle);
  }

  return (
    <section aria-labelledby="hero-title" className={styles.hero} id="inicio">
      <div className={styles.heroPhoto} data-parallax="0.8">
        <picture>
          <source
            media="(orientation: landscape), (min-aspect-ratio: 1/1)"
            sizes="100vw"
            srcSet={desktop.srcSet}
            type="image/webp"
          />
          <source sizes="100vw" srcSet={mobile.srcSet} type="image/webp" />
          <img
            alt={content.assets.heroPhoto.alt}
            className={styles.heroImage}
            decoding="async"
            fetchPriority="high"
            height={mobile.height}
            loading="eager"
            sizes="100vw"
            src={mobile.fallbackSrc}
            srcSet={mobile.srcSet}
            width={mobile.width}
          />
        </picture>
        <HeroVideo
          desktopPoster={desktop.src}
          desktopSrc="/videos/hero/hero-desktop.mp4"
          mobilePoster={mobile.src}
          mobileSrc="/videos/hero/hero-mobile.mp4"
        />
      </div>
      <span aria-hidden="true" className={styles.heroVeil} />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy} data-reveal>
          <p className={[styles.heroEyebrow, styles.heroStagger].join(" ")}>{content.hero.eyebrow}</p>
          <h1 id="hero-title"><span className={styles.heroStagger}>Maria</span><span className={styles.heroStagger}>&amp; Sérgio</span></h1>
          <div className={[styles.heroRule, styles.heroStagger].join(" ")} aria-hidden="true"><span /></div>
          <p className={[styles.heroLocation, styles.heroStagger].join(" ")}>{content.hero.location}</p>
        </div>
      </div>
      <a aria-label="Ir para a contagem regressiva" className={styles.scrollCue} href="#data" onClick={scrollToCountdown}>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
