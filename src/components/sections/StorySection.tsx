import Image from "next/image";
import type { CSSProperties } from "react";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { WatercolorPlaceholder } from "@/components/ui/WatercolorPlaceholder";
import type { StoryConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type StorySectionProps = { story: StoryConfig };

export function StorySection({ story }: StorySectionProps) {
  return (
    <section aria-labelledby="story-title" className={["section", styles.storySection].join(" ")} id="historia">
      <div className="section-inner">
        <SectionHeading description={story.introduction.value ?? story.introduction.placeholder} eyebrow={story.eyebrow} title={story.title} />
        <div className={styles.storyTimeline}>
          <span aria-hidden="true" className={styles.storyLine} />
          {story.chapters.map((chapter, index) => (
            <article className={[styles.storyChapter, styles[chapter.alignment]].join(" ")} key={chapter.id}>
              {chapter.image.value ? (
                <figure
                  className={[styles.storyImage, styles.photoFrame, chapter.imageTreatment?.overlay ? styles["photoOverlay" + chapter.imageTreatment.overlay] : ""].filter(Boolean).join(" ")}
                  data-reveal
                  style={{
                    "--photo-position-desktop": chapter.imageTreatment?.desktopPosition,
                    "--photo-position-mobile": chapter.imageTreatment?.mobilePosition,
                  } as CSSProperties}
                >
                  <Image
                    alt={chapter.imageAlt}
                    fill
                    sizes="(max-width: 56rem) 86vw, 42vw"
                    src={chapter.image.value}
                  />
                  <figcaption>{chapter.caption.value ?? chapter.caption.placeholder}</figcaption>
                </figure>
              ) : (
                <WatercolorPlaceholder
                  aspect={index === 1 ? "landscape" : "portrait"}
                  caption={chapter.image.placeholder}
                  className={styles.storyImage}
                  index={index + 1}
                />
              )}
              <div className={styles.storyCopy} data-reveal>
                <span className={styles.storyIndex}>{String(index + 1).padStart(2, "0")}</span>
                <p className={styles.pendingLabel}>{chapter.date.value ?? chapter.date.placeholder}</p>
                <h3>{chapter.title.value ?? chapter.title.placeholder}</h3>
                <p>{chapter.body.value ?? chapter.body.placeholder}</p>
                <small>{chapter.caption.value ?? chapter.caption.placeholder}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
