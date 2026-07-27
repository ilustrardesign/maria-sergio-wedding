import styles from "./ui.module.css";

type SectionHeadingProps = {
  align?: "center" | "left";
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  align = "center",
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <header className={[styles.sectionHeading, styles[align]].join(" ")} data-reveal>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
