# RSVP Guest Validation Architecture

## A) Current Free Form

The current form lets guests type their names and companions freely. This is flexible and handles real cases well: changed companions, couples, children, guests without email, declined invitations, and spelling variations. The tradeoff is manual reconciliation in the Google Sheet.

## B) Invite Or Family Code

An invite code can identify a household or group without exposing the guest list in the browser. The form can collect `inviteCode`, `primaryName`, attendance, companion names, and message. The backend validates the code and max guest count server-side before writing to the Google Sheet.

This handles shared family invitations and avoids hardcoding names in the frontend bundle. It still needs a graceful path for typos, lost codes, and last-minute companion changes.

## C) Server-Side Google Sheet Lookup

A second Google Sheet tab can store invitation records:

- `inviteCode`
- `primaryName`
- `maxGuests`
- `groupName`
- optional notes/status

The Next.js `/api/rsvp` route or Apps Script validates against that tab server-side, then writes the RSVP row. The browser never receives the complete guest list.

## Recommendation

If guest validation is added later, use server-side lookup with `inviteCode`, `primaryName`, and `maxGuests`. Keep a manual review path for spelling errors, companion swaps, couples, children, guests without email, and declined invitations. Do not hardcode a guest list in frontend code or ship it in the browser bundle.
