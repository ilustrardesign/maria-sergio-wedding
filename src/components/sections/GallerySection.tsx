import Image from "next/image";
import type { CSSProperties } from "react";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { WatercolorPlaceholder } from "@/components/ui/WatercolorPlaceholder";
import type { GalleryConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

export function GallerySection({ gallery }: { gallery: GalleryConfig }) {
  return (
    <section aria-labelledby="gallery-title" className={["section", styles.gallerySection].join(" ")} id="galeria">
      <div className="section-inner">
        <SectionHeading eyebrow={gallery.eyebrow} title={gallery.title} description={gallery.introduction.value ?? gallery.introduction.placeholder} />
        <h2 className="sr-only" id="gallery-title">Galeria de fotografias</h2>
        <div className={styles.galleryGrid}>
          {gallery.items.map((item, index) => {
            const className = [styles["galleryItem" + (index + 1)]];
            if (item.src.value) className.push(styles.galleryPhoto, styles[item.aspectRatio]);
            if (item.treatment?.overlay) className.push(styles["photoOverlay" + item.treatment.overlay]);

            return item.src.value ? (
              <figure
                className={className.filter(Boolean).join(" ")}
                data-reveal
                key={item.id}
                style={{
                  "--photo-position-desktop": item.treatment?.desktopPosition,
                  "--photo-position-mobile": item.treatment?.mobilePosition,
                } as CSSProperties}
              >
                <Image alt={item.alt} fill sizes="(max-width: 40rem) 88vw, 42vw" src={item.src.value} />
                <figcaption>{item.caption.value ?? item.src.placeholder}</figcaption>
              </figure>
            ) : (
              <WatercolorPlaceholder
                aspect={item.aspectRatio}
                caption={item.caption.value ?? item.src.placeholder}
                className={styles["galleryItem" + (index + 1)]}
                index={index + 1}
                key={item.id}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
