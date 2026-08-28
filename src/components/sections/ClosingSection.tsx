"use client";

import { useEffect, useMemo, useState } from "react";

import { BotanicalCorner } from "@/components/ui/Botanical";
import { Icon } from "@/components/ui/Icon";
import { Monogram } from "@/components/ui/Monogram";
import { createCalendarFile, createGoogleCalendarUrl } from "@/lib/calendar";
import type { WeddingContent } from "@/types/wedding";

import styles from "./ClosingSection.module.css";

type ClosingSectionProps = { content: WeddingContent };

type LiveStatus = { id: number; message: string };

function nextIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10);
}

export function ClosingSection({ content }: ClosingSectionProps) {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>({ id: 0, message: "" });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendar = content.closing.calendar;

  const calendarEvent = useMemo(() => ({
    startDate: content.date.isoDate,
    endDate: nextIsoDate(content.date.isoDate),
    title: calendar.eventTitle,
    description: calendar.description.status === "confirmed" ? calendar.description.value ?? "" : "",
    location: calendar.location.status === "confirmed" ? calendar.location.value ?? undefined : undefined,
  }), [calendar, content.date.isoDate]);

  const googleCalendarUrl = useMemo(() => createGoogleCalendarUrl(calendarEvent), [calendarEvent]);

  useEffect(() => {
    if (!calendarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCalendarOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [calendarOpen]);

  function announce(message: string) {
    setLiveStatus((current) => ({ id: current.id + 1, message }));
  }

  function downloadCalendarFile() {
    const file = createCalendarFile(calendarEvent);
    const fileUrl = URL.createObjectURL(file);
    const download = document.createElement("a");
    download.href = fileUrl;
    download.download = "casamento-maria-e-sergio.ics";
    document.body.appendChild(download);
    download.click();
    download.remove();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 0);
    announce("Arquivo de calendário preparado para download.");
  }

  function scrollToTop() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return (
    <section aria-labelledby="closing-title" className={["section", styles.closing].join(" ")} id="encerramento">
      <span aria-hidden="true" className={styles.skyWash} />
      <span aria-hidden="true" className={styles.horizon} />
      <BotanicalCorner className={styles.botanicalLeft} />
      <BotanicalCorner className={styles.botanicalRight} />

      <div className={["section-inner", styles.closingInner].join(" ")}>
        <Monogram className={styles.monogram} src={content.assets.monogram.src} />
        <p className={styles.eyebrow}>{content.closing.eyebrow}</p>
        <h2 id="closing-title">{content.closing.thankYou}</h2>
        <p className={styles.names}>{content.closing.names}</p>
        <time className={styles.date} dateTime={content.date.isoDate}>{content.closing.date}</time>

        <div aria-label="Calendário" className={styles.actions}>
          <button
            className={["button", styles.action, styles.actionPrimary].join(" ")}
            onClick={() => setCalendarOpen(true)}
            type="button"
          >
            <Icon name="calendar" size={18} />
            Adicionar ao calendário
          </button>
        </div>

        <button className={styles.backLink} onClick={scrollToTop} type="button">
          <Icon name="top" size={17} />
          {content.closing.backToTopLabel}
        </button>
        <p className={styles.developerCredit}>Desenvolvido carinhosamente por: <a href="https://wa.me/59161617222" rel="noreferrer" target="_blank">Ivo Pereira</a></p>

        <p aria-live="polite" className="sr-only" key={liveStatus.id} role="status">
          {liveStatus.message}
        </p>
      </div>
      {calendarOpen ? (
        <div aria-labelledby="calendar-modal-title" aria-modal="true" className={styles.calendarBackdrop} role="dialog">
          <button aria-label="Fechar calendário" className={styles.calendarBackdropDismiss} onClick={() => setCalendarOpen(false)} type="button" />
          <div className={styles.calendarSheet}>
            <button aria-label="Fechar" className={styles.calendarClose} onClick={() => setCalendarOpen(false)} type="button"><Icon name="close" size={18} /></button>
            <p className={styles.calendarEyebrow}>Adicionar ao calendário</p>
            <h3 id="calendar-modal-title">Maria &amp; Sérgio</h3>
            <p className={styles.calendarDate}>{content.closing.date}</p>
            <div className={styles.calendarModalActions}>
              <a className={["button", styles.calendarPrimaryAction].join(" ")} href={googleCalendarUrl} rel="noreferrer" target="_blank"><Icon name="calendar" size={17} />Google Calendar</a>
              <button className={["button", styles.calendarSecondaryAction].join(" ")} onClick={() => { downloadCalendarFile(); setCalendarOpen(false); }} type="button"><Icon name="calendar" size={17} />Baixar .ics</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
