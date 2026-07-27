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
          {gallery.items.map((item, index) => (
            <WatercolorPlaceholder
              aspect={item.aspectRatio}
              caption={item.caption.value ?? item.src.placeholder}
              className={styles["galleryItem" + (index + 1)]}
              index={index + 1}
              key={item.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
