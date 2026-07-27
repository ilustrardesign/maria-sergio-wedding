import Image from "next/image";

import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { VenueConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type VenuesSectionProps = { venues: VenueConfig[] };

function FieldValue({ value, placeholder }: { value: string | null; placeholder: string }) {
  return <span className={value ? undefined : styles.pendingValue}>{value ?? placeholder}</span>;
}

export function VenuesSection({ venues }: VenuesSectionProps) {
  return (
    <section aria-labelledby="venues-title" className={["section", styles.venuesSection].join(" ")} id="celebracao">
      <div className="section-inner">
        <SectionHeading eyebrow="Celebração" title="Do altar ao brinde" description="Dois cenários conectados pela mesma paisagem, aguardando os últimos detalhes práticos." />
        <h2 className="sr-only" id="venues-title">Locais da cerimônia e recepção</h2>
        <div className={styles.venueGrid}>
          {venues.map((venue, index) => {
            const hasRoute = Boolean(venue.directionsUrl.value);
            return (
              <article className={styles.venueCard} key={venue.id} data-reveal>
                <div className={[styles.venueVisual, venue.id === "reception" ? styles.receptionVisual : ""].join(" ")}>
                  {venue.illustration.value ? (
                    <Image
                      alt={venue.id === "ceremony" ? "Aquarela da Paróquia Nossa Senhora de Nazaré" : "Imagem do local da recepção"}
                      fill
                      sizes="(max-width: 767px) 92vw, 45vw"
                      src={venue.illustration.value}
                    />
                  ) : (
                    <><span aria-hidden="true" className={styles.venueArch} /><span className={styles.placeholderTag}>{venue.illustration.placeholder}</span></>
                  )}
                  <span className={styles.venueNumber}>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className={styles.venueDetails}>
                  <p className={styles.venueEyebrow}>{venue.eyebrow}</p>
                  <h3>{venue.name}</h3>
                  <dl>
                    <div><dt>Horário</dt><dd><FieldValue value={venue.time.value} placeholder={venue.time.placeholder} /></dd></div>
                    <div><dt>Local</dt><dd><FieldValue value={venue.city.value} placeholder={venue.city.placeholder} />{venue.region.value ? ", " + venue.region.value : ""}</dd></div>
                    <div><dt>Endereço</dt><dd><FieldValue value={venue.address.value} placeholder={venue.address.placeholder} /></dd></div>
                  </dl>
                  {hasRoute ? (
                    <a className="button" href={venue.directionsUrl.value ?? undefined} rel="noreferrer" target="_blank"><Icon name="pin" size={18} />{venue.directionsLabel}</a>
                  ) : (
                    <button aria-describedby={venue.id + "-route-note"} className="button" disabled type="button"><Icon name="pin" size={18} />{venue.directionsLabel}</button>
                  )}
                  {!hasRoute ? <small id={venue.id + "-route-note"}>Rota aguardando endereço confirmado.</small> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
