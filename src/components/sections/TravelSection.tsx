import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { TravelConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

export function TravelSection({ travel }: { travel: TravelConfig }) {
  if (!travel.enabled) return null;
  return (
    <section aria-labelledby="travel-title" className={["section", styles.travelSection].join(" ")} id="viagem">
      <div className="section-inner">
        <Icon className={styles.travelIcon} name="plane" size={38} />
        <SectionHeading eyebrow={travel.eyebrow} title={travel.title} description={travel.introduction.value ?? travel.introduction.placeholder} />
        <h2 className="sr-only" id="travel-title">Viagem e hospedagem</h2>
        <div className={styles.travelGrid}>
          <article><h3>Aeroporto</h3><p>{travel.airport.value ?? travel.airport.placeholder}</p></article>
          <article><h3>Deslocamento</h3><p>{travel.transportation.value ?? travel.transportation.placeholder}</p></article>
          <article><h3>Hospedagem</h3><p>{travel.hotels.value?.join(", ") ?? travel.hotels.placeholder}</p></article>
        </div>
      </div>
    </section>
  );
}
