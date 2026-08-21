type BotanicalProps = {
  className?: string;
};

export function BotanicalDivider({ className }: BotanicalProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 760 120">
      <path d="M94 62c92 18 185 18 286 0s194-18 286 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
      <path d="M380 62c-34-29-61-44-95-44 20 27 47 41 95 44Zm0 0c34-29 61-44 95-44-20 27-47 41-95 44Z" stroke="currentColor" strokeWidth="1" />
      <path d="M276 65c-24 11-45 16-70 13 15-18 36-23 70-13Zm208 0c24 11 45 16 70 13-15-18-36-23-70-13Z" stroke="currentColor" strokeWidth="1" />
      <circle cx="350" cy="54" r="4" fill="currentColor" opacity=".62" />
      <circle cx="380" cy="62" r="5" fill="currentColor" opacity=".72" />
      <circle cx="410" cy="54" r="4" fill="currentColor" opacity=".62" />
      <path d="M330 76c16 16 31 23 50 23 19 0 34-7 50-23" stroke="currentColor" strokeLinecap="round" strokeWidth="1" opacity=".75" />
    </svg>
  );
}

export function BotanicalCorner({ className }: BotanicalProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 220 300">
      <path d="M177 281C150 197 115 114 35 35" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M83 77c-35-4-55 5-67 29 33 5 54-5 67-29Zm34 42c-38 1-59 14-68 42 36 0 57-14 68-42Zm28 54c-32 8-49 24-52 49 31-7 47-23 52-49Z" stroke="currentColor" strokeWidth="1" />
      <path d="M93 88c4-31 18-49 43-57-2 31-18 49-43 57Zm38 49c8-34 25-53 52-59-6 34-24 53-52 59Zm25 57c12-28 30-42 55-43-11 28-30 42-55 43Z" stroke="currentColor" strokeWidth="1" />
      <circle cx="63" cy="56" r="5" fill="currentColor" opacity=".58" />
      <circle cx="104" cy="104" r="4" fill="currentColor" opacity=".5" />
      <circle cx="139" cy="159" r="4" fill="currentColor" opacity=".5" />
    </svg>
  );
}

export function BotanicalSprig({ className }: BotanicalProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 260 150">
      <path d="M24 122c54-62 114-91 212-96" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M68 82c-25-13-42-13-59 0 22 15 40 15 59 0Zm42-24c-22-18-40-22-60-12 19 19 37 23 60 12Zm49-17c-18-21-35-29-57-24 15 23 33 31 57 24Z" stroke="currentColor" strokeWidth="1" />
      <path d="M88 71c8-26 22-39 43-42-5 26-20 40-43 42Zm54-22c14-24 31-34 53-32-11 24-28 35-53 32Zm53-13c18-19 36-25 56-18-16 20-35 27-56 18Z" stroke="currentColor" strokeWidth="1" />
      <circle cx="119" cy="63" r="4" fill="currentColor" opacity=".62" />
      <circle cx="174" cy="41" r="3.5" fill="currentColor" opacity=".54" />
      <circle cx="215" cy="30" r="3" fill="currentColor" opacity=".5" />
    </svg>
  );
}
