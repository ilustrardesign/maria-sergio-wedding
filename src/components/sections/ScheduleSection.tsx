import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ScheduleConfig, ScheduleIcon } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

const iconMap: Record<ScheduleIcon, IconName> = {
  church: "church",
  celebration: "rings",
  dinner: "dinner",
  music: "music",
  rings: "rings",
};

export function ScheduleSection({ schedule }: { schedule: ScheduleConfig }) {
  return (
    <section aria-labelledby="schedule-title" className={["section", styles.scheduleSection].join(" ")} id="programacao">
      <div className="section-inner">
        <SectionHeading eyebrow={schedule.eyebrow} title={schedule.title} description="A sequência do dia está pronta para receber os horários finais, sem antecipar informações ainda não confirmadas." />
        <h2 className="sr-only" id="schedule-title">Programação do casamento</h2>
        <ol className={styles.scheduleList}>
          {schedule.items.map((item, index) => (
            <li key={item.id} data-reveal>
              <div className={styles.scheduleIcon}><Icon name={iconMap[item.icon]} size={28} /><span>{String(index + 1).padStart(2, "0")}</span></div>
              <div className={styles.scheduleCopy}>
                <p>{item.time.value ?? item.time.placeholder}</p>
                <h3>{item.title}</h3>
                <span>{item.description.value ?? item.description.placeholder}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
