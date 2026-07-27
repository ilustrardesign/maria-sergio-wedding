import type { CSSProperties } from "react";

import styles from "./ui.module.css";

type MonogramProps = {
  className?: string;
  label?: string;
  src?: string;
};

export function Monogram({
  className = "",
  label = "Monograma de Maria e Sérgio",
  src = "/images/monogram.png",
}: MonogramProps) {
  return (
    <span
      aria-label={label}
      className={[styles.monogram, className].filter(Boolean).join(" ")}
      role="img"
      style={{ "--monogram-source": 'url("' + src + '")' } as CSSProperties}
    />
  );
}
