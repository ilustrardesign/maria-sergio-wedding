export type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "church"
  | "close"
  | "copy"
  | "dinner"
  | "dress"
  | "gift"
  | "heart"
  | "menu"
  | "music"
  | "pause"
  | "pin"
  | "plane"
  | "play"
  | "rings"
  | "share"
  | "sparkle"
  | "top"
  | "volume";

type IconProps = {
  className?: string;
  name: IconName;
  size?: number;
};

const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="m5 12 14 0m-5-5 5 5-5 5" />,
  calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M8 3v5M16 3v5M3.5 10h17" /></>,
  check: <path d="m5 12 4 4L19 7" />,
  church: <><path d="M4 21h16M6 21V10l6-4 6 4v11M9 21v-6h6v6" /><path d="M12 2v5M9.5 4.5h5" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>,
  dinner: <><path d="M5 3v8M3 3v5a2 2 0 0 0 4 0V3M5 11v10" /><path d="M15 3c3 2 3 7 0 9v9M15 3v9h4" /></>,
  dress: <><path d="m10 3 2 3 2-3M9 6h6l-1 5 4 10H6l4-10Z" /><path d="M9 6 6 9M15 6l3 3" /></>,
  gift: <><rect x="3" y="9" width="18" height="12" rx="1" /><path d="M12 9v12M2 9h20v-4H2z" /><path d="M12 5c-1-4-7-3-5 0 1 2 5 0 5 0Zm0 0c1-4 7-3 5 0-1 2-5 0-5 0Z" /></>,
  heart: <path d="M20.5 9c0 5-8.5 10-8.5 10S3.5 14 3.5 9A4.5 4.5 0 0 1 12 6.9 4.5 4.5 0 0 1 20.5 9Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  music: <><path d="M9 18V5l11-2v13" /><ellipse cx="6" cy="18" rx="3" ry="2.2" /><ellipse cx="17" cy="16" rx="3" ry="2.2" /></>,
  pause: <path d="M9 7v10M15 7v10" />,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  plane: <path d="m3 13 8 1 6 7 2-1-3-8 5-5c1-1 1-3 0-4-1-1-3-1-4 0l-5 5-8-3-1 2 7 6-7-2Z" />,
  play: <path d="m9 7 9 5-9 5Z" />,
  rings: <><circle cx="9" cy="13" r="6" /><circle cx="15" cy="13" r="6" /><path d="m12 4 2-2 2 2-2 3Z" /></>,
  share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.5-4.5M8.2 13.2l7.5 4.5" /></>,
  sparkle: <path d="M12 2c.6 5.5 2.5 7.4 8 8-5.5.6-7.4 2.5-8 8-.6-5.5-2.5-7.4-8-8 5.5-.6 7.4-2.5 8-8Z" />,
  top: <path d="m6 14 6-6 6 6M12 8v12" />,
  volume: <><path d="M4 10v4h4l5 4V6l-5 4Z" /><path d="M16 9c2 2 2 4 0 6M19 6c4 4 4 8 0 12" /></>,
};

export function Icon({ className, name, size = 24 }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45">{paths[name]}</g>
    </svg>
  );
}
