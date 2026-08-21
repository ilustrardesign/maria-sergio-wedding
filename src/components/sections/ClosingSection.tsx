"use client";

import { useMemo, useState } from "react";

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
  const calendar = content.closing.calendar;

  const calendarEvent = useMemo(() => ({
    startDate: content.date.isoDate,
    endDate: nextIsoDate(content.date.isoDate),
    title: calendar.eventTitle,
    description: calendar.description.status === "confirmed" ? calendar.description.value ?? "" : "",
    location: calendar.location.status === "confirmed" ? calendar.location.value ?? undefined : undefined,
  }), [calendar, content.date.isoDate]);

  const googleCalendarUrl = useMemo(() => createGoogleCalendarUrl(calendarEvent), [calendarEvent]);

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

        <div aria-label="Calendário" className={styles.actions} role="group">
          <button
            className={["button", styles.action, styles.actionPrimary].join(" ")}
            onClick={downloadCalendarFile}
            type="button"
          >
            <Icon name="calendar" size={18} />
            {calendar.downloadLabel}
            <span aria-hidden="true" className={styles.actionMeta}>.ics</span>
          </button>

          <a
            className={["button", styles.action].join(" ")}
            href={googleCalendarUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Icon name="calendar" size={18} />
            Google Calendar
          </a>
        </div>

        <button className={styles.backLink} onClick={scrollToTop} type="button">
          <Icon name="top" size={17} />
          {content.closing.backToTopLabel}
        </button>

        <p aria-live="polite" className="sr-only" key={liveStatus.id} role="status">
          {liveStatus.message}
        </p>
      </div>
    </section>
  );
}
