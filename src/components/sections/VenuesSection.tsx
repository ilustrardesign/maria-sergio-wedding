import Image from "next/image";

import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { VenueConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type VenuesSectionProps = { venues: VenueConfig[] };

function FieldValue({ value }: { value: string }) {
  return <span>{value}</span>;
}

export function VenuesSection({ venues }: VenuesSectionProps) {
  return (
    <section aria-labelledby="venues-title" className={["section", styles.venuesSection].join(" ")} id="celebracao">
      <div className="section-inner">
        <SectionHeading
          eyebrow="CELEBRAÇÃO"
          title="Cerimônia e recepção"
          description="Confira os locais escolhidos para compartilharmos cada momento deste dia com você."
        />
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
                    <span aria-hidden="true" className={styles.venueArch} />
                  )}
                  <span className={styles.venueNumber}>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className={styles.venueDetails}>
                  <p className={styles.venueEyebrow}>{venue.eyebrow}</p>
                  <h3>{venue.name}</h3>
                  <dl>
                    {venue.time.value ? <div><dt>Horário</dt><dd><FieldValue value={venue.time.value} /></dd></div> : null}
                    {venue.city.value ? <div><dt>Local</dt><dd><FieldValue value={venue.city.value} />{venue.region.value ? ", " + venue.region.value : ""}</dd></div> : null}
                    {venue.address.value ? <div><dt>Endereço</dt><dd><FieldValue value={venue.address.value} /></dd></div> : null}
                  </dl>
                  {venue.note.value ? <p className={styles.venueNote}>{venue.note.value}</p> : null}
                  {hasRoute ? (
                    <a className="button" href={venue.directionsUrl.value ?? undefined} rel="noreferrer" target="_blank"><Icon name="pin" size={18} />{venue.directionsLabel}</a>
                  ) : (
                    <button className="button" disabled type="button"><Icon name="pin" size={18} />{venue.directionsLabel}</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
