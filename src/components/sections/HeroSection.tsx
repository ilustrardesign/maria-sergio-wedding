import Image from "next/image";

import { Monogram } from "@/components/ui/Monogram";
import type { WeddingContent } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type HeroSectionProps = { content: WeddingContent };

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-title" className={styles.hero} id="inicio">
      <span aria-hidden="true" className={styles.heroWash} />
      <span aria-hidden="true" className={styles.heroSea} data-parallax="4" />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy} data-reveal>
          <Monogram className={styles.heroMonogram} src={content.assets.monogram.src} />
          <p className={styles.heroEyebrow}>{content.hero.eyebrow}</p>
          <h1 id="hero-title">{content.hero.title}</h1>
          <div className={styles.heroRule} aria-hidden="true"><span /></div>
          <p className={styles.heroDate}>{content.hero.date}</p>
          <p className={styles.heroLocation}>{content.hero.location}</p>
        </div>
        <figure className={styles.heroArtwork} data-reveal>
          <span aria-hidden="true" className={styles.artworkHalo} />
          <div className={styles.artworkMask} data-parallax="-3">
            <Image
              alt={content.assets.saveTheDate.alt}
              fill
              priority
              sizes="(max-width: 767px) 90vw, 52vw"
              src={content.assets.saveTheDate.src}
            />
          </div>
          <figcaption className="sr-only">Arte original do Save the Date</figcaption>
        </figure>
      </div>
      <a aria-label="Ir para a contagem regressiva" className={styles.scrollCue} href="#data">
        <span>Descobrir</span><i aria-hidden="true" />
      </a>
    </section>
  );
}
