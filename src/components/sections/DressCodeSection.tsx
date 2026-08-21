import { Icon } from "@/components/ui/Icon";
import { BotanicalCorner } from "@/components/ui/Botanical";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { DressCodeConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeConfig }) {
  return (
    <section aria-labelledby="dress-title" className={["section", styles.dressSection].join(" ")} id="traje">
      <span aria-hidden="true" className={styles.dressWash} />
      <BotanicalCorner className={styles.dressBotanical} />
      <div className="section-inner">
        <div className={styles.dressIntro}>
          <SectionHeading align="left" eyebrow={dressCode.eyebrow} title={dressCode.title} description={dressCode.introduction.value ?? dressCode.introduction.placeholder} />
        </div>
        <h2 className="sr-only" id="dress-title">Orientações de traje</h2>
        <div className={styles.dressCard} data-reveal>
          <Icon className={styles.dressIcon} name="dress" size={48} />
          {dressCode.groups.map((group) => (
            <article key={group.id}>
              <p>{group.label}</p>
              <h3>{group.guidance.value ?? group.guidance.placeholder}</h3>
              {group.guidance.status === "pending" ? <small>Aguardando confirmação</small> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
