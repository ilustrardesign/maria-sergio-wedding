"use client";

import { useEffect, useMemo, useState } from "react";

import { BotanicalDivider } from "@/components/ui/Botanical";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCountdown, type CountdownValue } from "@/lib/countdown";
import type { WeddingContent } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type CountdownSectionProps = { content: WeddingContent };

export function CountdownSection({ content }: CountdownSectionProps) {
  const targetIso = useMemo(() => content.date.isoDate + "T00:00:00-03:00", [content.date.isoDate]);
  const [countdown, setCountdown] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const update = () => setCountdown(getCountdown(targetIso));
    const initialTimer = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [targetIso]);

  const units = [
    ["days", content.announcement.countdownLabels.days],
    ["hours", content.announcement.countdownLabels.hours],
    ["minutes", content.announcement.countdownLabels.minutes],
    ["seconds", content.announcement.countdownLabels.seconds],
  ] as const;

  return (
    <section aria-labelledby="countdown-title" className={["section", styles.countdownSection].join(" ")} id="data">
      <div className="section-inner">
        <SectionHeading
          description={content.announcement.invitation}
          eyebrow={content.announcement.eyebrow}
          title={content.announcement.title}
        />
        {countdown && countdown.status !== "counting" ? (
          <p aria-live="polite" className={styles.countdownComplete}>{content.announcement.countdownComplete}</p>
        ) : (
          <div aria-label="Contagem regressiva para o casamento" className={styles.countdown} data-reveal>
            {units.map(([key, label]) => (
              <div className={styles.countdownUnit} key={key}>
                <strong>{countdown ? String(countdown[key]).padStart(2, "0") : "—"}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
        <BotanicalDivider className={styles.countdownBotanical} />
      </div>
    </section>
  );
}
