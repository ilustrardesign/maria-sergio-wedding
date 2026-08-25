# RSVP production checklist

Status: BLOCKED

## Current configuration

- `NEXT_PUBLIC_RSVP_MODE`: SET
- `RSVP_APPS_SCRIPT_URL`: NOT SET
- `RSVP_SHARED_SECRET`: NOT SET
- `RESEND_ENABLED`: NOT SET

## Required behavior

- Search must return only private registry matches.
- The browser must only submit `selectedGuestIds`.
- Apps Script must reject any invalid ID set.
- Canonical names must be written from the registry.
- The full registry must never be shipped to the browser.

## Google Sheet

Status: PASS

- Tab: `Convidados`
- Private registry kept server-side
- Submission tab: `RSVP`

## Apps Script

Expected endpoints:

- `search`
- `submit`

## Manual smoke test

1. Open the site locally.
2. Type `ped`.
3. Select `Pedro Ivo`.
4. Type `kat`.
5. Select `Katherine`.
6. Remove one chip.
7. Type an unknown name.
8. Confirm no free-text chip can be created.
