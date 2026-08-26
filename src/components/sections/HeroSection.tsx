import { getImageProps } from "next/image";

import type { WeddingContent } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type HeroSectionProps = { content: WeddingContent };

export function HeroSection({ content }: HeroSectionProps) {
  const commonImageProps = {
    alt: content.assets.heroPhoto.alt,
    priority: true,
    sizes: "100vw",
  };
  const {
    props: { srcSet: desktopSrcSet, sizes: desktopSizes },
  } = getImageProps({
    ...commonImageProps,
    height: content.assets.heroPhotoDesktop.height,
    src: content.assets.heroPhotoDesktop.src,
    width: content.assets.heroPhotoDesktop.width,
  });
  const { props: mobileImageProps } = getImageProps({
    ...commonImageProps,
    height: content.assets.heroPhotoMobile.height,
    src: content.assets.heroPhotoMobile.src,
    width: content.assets.heroPhotoMobile.width,
  });

  return (
    <section aria-labelledby="hero-title" className={styles.hero} id="inicio">
      <div className={styles.heroPhoto} data-parallax="0.8">
        <picture>
          <source
            media="(orientation: landscape), (min-aspect-ratio: 1/1)"
            sizes={desktopSizes}
            srcSet={desktopSrcSet}
          />
          <img {...mobileImageProps} alt={content.assets.heroPhoto.alt} className={styles.heroImage} />
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
