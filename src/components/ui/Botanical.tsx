type BotanicalProps = {
  className?: string;
};

export function BotanicalDivider({ className }: BotanicalProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 760 128">
      <path d="M106 76c74-18 137-19 204-6 81 16 151 9 225-17 45-16 84-19 119-8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.15" />
      <path d="M263 67c-32-24-60-31-91-21 25 25 55 32 91 21Zm57 8c-21 23-45 34-75 34 17-27 41-39 75-34Zm113-8c29-28 58-39 91-34-22 30-51 42-91 34Zm70-18c10-29 28-46 55-52-4 31-23 50-55 52Z" stroke="currentColor" strokeWidth="1" />
      <path d="M338 72c26-8 52-8 78 1" stroke="currentColor" strokeLinecap="round" strokeWidth="0.9" opacity=".72" />
      <path d="M606 49c17 12 31 17 48 16" stroke="currentColor" strokeLinecap="round" strokeWidth="0.9" opacity=".64" />
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
