import type { WeddingContent } from "@/types/wedding";
import { heroImages } from "@/generated/hero-images";

import styles from "./EditorialSections.module.css";

type HeroSectionProps = { content: WeddingContent };

export function HeroSection({ content }: HeroSectionProps) {
  const desktop = heroImages.desktop;
  const mobile = heroImages.mobile;

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
      <a aria-label="Ir para a contagem regressiva" className={styles.scrollCue} href="#data">
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
