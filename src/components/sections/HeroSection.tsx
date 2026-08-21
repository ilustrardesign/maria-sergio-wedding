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
      <div className={styles.heroPhoto} data-parallax="3">
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
          <p className={styles.heroEyebrow}>{content.hero.eyebrow}</p>
          <h1 id="hero-title">{content.hero.title}</h1>
          <div className={styles.heroRule} aria-hidden="true"><span /></div>
          <p className={styles.heroLocation}>{content.hero.location}</p>
        </div>
      </div>
      <a aria-label="Ir para a contagem regressiva" className={styles.scrollCue} href="#data">
        <span>Descobrir</span><i aria-hidden="true" />
      </a>
    </section>
  );
}
