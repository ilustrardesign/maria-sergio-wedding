import styles from "./ui.module.css";

type WatercolorPlaceholderProps = {
  aspect?: "landscape" | "portrait" | "square" | "tall";
  caption: string;
  className?: string;
  index?: number;
};

export function WatercolorPlaceholder({
  aspect = "portrait",
  caption,
  className = "",
  index = 1,
}: WatercolorPlaceholderProps) {
  return (
    <figure
      className={[styles.placeholder, styles[aspect], className].filter(Boolean).join(" ")}
      data-placeholder-index={index}
      data-reveal
    >
      <span aria-hidden="true" className={styles.placeholderWash} />
      <span aria-hidden="true" className={styles.placeholderLeaf} />
      <figcaption>
        <span>Fotografia {String(index).padStart(2, "0")}</span>
        {caption}
      </figcaption>
    </figure>
  );
}
