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
      {gifts.items.length > 0 ? (
        <div className={["section-inner", styles.giftListWrap].join(" ")}>
          <ol className={styles.giftList} data-reveal>
            {gifts.items.map((item, index) => (
              <li className={styles.giftItem} key={item.id}>
                <span className={styles.giftNumber}>{String(index + 1).padStart(2, "0")}</span>
                <p>{item.title}</p>
                <strong>{item.price}</strong>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
