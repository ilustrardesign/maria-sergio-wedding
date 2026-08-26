"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { VenueConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type VenuesSectionProps = { venues: VenueConfig[] };

function FieldValue({ value }: { value: string }) {
  return <span>{value}</span>;
}

export function VenuesSection({ venues }: VenuesSectionProps) {
  const [activeVenue, setActiveVenue] = useState<VenueConfig | null>(null);
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeVenue) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveVenue(null);
      if (event.key !== "Tab") return;
      const focusable = Array.from(document.querySelectorAll<HTMLElement>('.directionsSheet a[href], .directionsSheet button:not([disabled])'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeVenue]);

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

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
                  <div className={styles.venueDetailsHeader}>
                    <Icon className={styles.venueIcon} name={venue.id === "ceremony" ? "church" : "sparkle"} size={22} />
                    <p className={styles.venueEyebrow}>{venue.eyebrow}</p>
                  </div>
                  <h3 aria-label={venue.id === "ceremony" ? "Paróquia Nossa Senhora de Nazaré" : venue.name}>{venue.name}</h3>
                  <dl>
                    {venue.time.value ? <div><dt>Horário</dt><dd><FieldValue value={venue.time.value} /></dd></div> : null}
                    {venue.city.value ? <div><dt>Local</dt><dd><FieldValue value={venue.city.value} />{venue.region.value ? ", " + venue.region.value : ""}</dd></div> : null}
                    {venue.address.value ? <div><dt>Endereço</dt><dd><FieldValue value={venue.address.value} /></dd></div> : null}
                  </dl>
                  {venue.note.value ? <p className={styles.venueNote}>{venue.note.value}</p> : null}
                  <button className="button" onClick={() => { setCopied(false); setActiveVenue(venue); }} type="button"><Icon name="pin" size={18} />{venue.directionsLabel}</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {activeVenue ? (() => {
        const destinationName = activeVenue.id === "ceremony" ? "Paróquia Nossa Senhora de Nazaré" : activeVenue.name;
        const address = [destinationName, activeVenue.address.value, activeVenue.city.value, activeVenue.region.value].filter(Boolean).join(", ");
        const encodedAddress = encodeURIComponent(address);
        const googleUrl = activeVenue.directionsUrl.value || `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        const wazeUrl = `https://www.waze.com/ul?q=${encodedAddress}&navigate=yes`;
        return (
          <div className={styles.directionsBackdrop} onClick={() => setActiveVenue(null)}>
            <div aria-labelledby="directions-title" aria-modal="true" className={styles.directionsSheet} onClick={(event) => event.stopPropagation()} role="dialog">
              <button aria-label="Fechar opções de rota" className={styles.directionsClose} onClick={() => setActiveVenue(null)} ref={closeButtonRef} type="button"><Icon name="close" size={18} /></button>
              <p className={styles.venueEyebrow}>COMO CHEGAR</p>
              <h2 id="directions-title">{activeVenue.name}</h2>
              <p className={styles.directionsAddress}>{address}</p>
              <div className={styles.directionsActions}>
                <a className="button button-primary" href={googleUrl} rel="noreferrer" target="_blank"><Icon name="pin" size={17} />Google Maps</a>
                <a className="button" href={wazeUrl} rel="noreferrer" target="_blank"><Icon name="arrow" size={17} />Waze</a>
                <button className="button" onClick={() => copyAddress(address)} type="button"><Icon name="copy" size={17} />{copied ? "Endereço copiado" : "Copiar endereço"}</button>
              </div>
            </div>
          </div>
        );
      })() : null}
    </section>
  );
}
