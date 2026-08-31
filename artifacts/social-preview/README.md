# Social preview candidates (not wired)

Both candidates are exactly **1200 × 630 px** PNGs and are intentionally outside `public/images/social` so they cannot affect production metadata.

- `whatsapp-og-a.png`: editorial photograph. The original 1070 × 1600 portrait is scaled to full height and centered over a very subtle, blurred extension of the same photograph. The couple, faces, and full silhouettes remain intact; no destructive crop.
- `whatsapp-og-b.png`: graphic editorial layout. A muted olive panel carries the proposed title/date while the full-height portrait occupies the right side (~35%); the couple remains intact and readable at thumbnail size.

Proposed metadata copy (not applied):

- Title: `Maria & Sérgio — 31 de outubro de 2026`
- Description: `Nosso grande dia está chegando. Será uma alegria celebrar com você.`

WhatsApp/Meta caches OG responses and images. After a future deploy, validate with Meta Sharing Debugger (and WhatsApp link preview in a fresh chat); use “Scrape Again” after confirming the production URL/image has changed. No external cache purge was performed in this round.
