import Image from "next/image";

import { Monogram } from "@/components/ui/Monogram";
import type { WeddingContent } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type HeroSectionProps = { content: WeddingContent };

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-title" className={styles.hero} id="inicio">
      <div className={styles.heroPhoto} data-parallax="3">
        <Image
          alt={content.assets.heroPhoto.alt}
          fill
          priority
          sizes="100vw"
          src={content.assets.heroPhoto.src}
        />
      </div>
      <span aria-hidden="true" className={styles.heroVeil} />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy} data-reveal>
          <Monogram className={styles.heroMonogram} src={content.assets.monogram.src} />
          <p className={styles.heroEyebrow}>{content.hero.eyebrow}</p>
          <h1 id="hero-title">{content.hero.title}</h1>
          <div className={styles.heroRule} aria-hidden="true"><span /></div>
          <p className={styles.heroDate}>{content.hero.date}</p>
          <p className={styles.heroLocation}>{content.hero.location}</p>
        </div>
        <p aria-hidden="true" className={styles.heroPhotoCaption}>{content.assets.heroPhoto.alt}</p>
      </div>
      <a aria-label="Ir para a contagem regressiva" className={styles.scrollCue} href="#data">
        <span>Descobrir</span><i aria-hidden="true" />
      </a>
    </section>
  );
}
