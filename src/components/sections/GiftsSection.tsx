import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { GiftsConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

export function GiftsSection({ gifts }: { gifts: GiftsConfig }) {
  const hasPlatform = Boolean(gifts.platform.value?.url);
  return (
    <section aria-labelledby="gifts-title" className={["section", styles.giftsSection].join(" ")} id="presentes">
      <div className={["section-inner", styles.giftsInner].join(" ")}>
        <div className={styles.giftsArt} aria-hidden="true" data-reveal>
          <span /><Icon name="gift" size={54} /><i />
        </div>
        <div className={styles.giftsCopy}>
          <SectionHeading align="left" eyebrow={gifts.eyebrow} title={gifts.title} description={gifts.message.value ?? gifts.message.placeholder} />
          <h2 className="sr-only" id="gifts-title">Lista de presentes</h2>
          {hasPlatform ? (
            <a className="button button-primary" href={gifts.platform.value?.url} rel="noreferrer" target="_blank">Abrir lista de presentes</a>
          ) : (
            <div className={styles.pendingGift} data-reveal><Icon name="sparkle" size={18} /><p>{gifts.pendingMessage}</p></div>
          )}
        </div>
      </div>
    </section>
  );
}
