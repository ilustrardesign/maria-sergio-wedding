# RSVP Guest Validation

The RSVP now works through a private guest registry and server-side search.

## Rules

- The browser only receives `guestId` and `displayName` from search.
- Free text cannot become a guest tag.
- Children are excluded from search and submission.
- Every submitted `guestId` is revalidated on the server before persistence.
- The browser never receives the full registry.

## Flow

1. User types a query.
2. The server returns up to 8 matching guests.
3. User selects only returned results.
4. The browser submits `guests: [{ guestId, attendance }]`, `phone`, `email`, and `message`.
5. The server validates each `guestId` and attendance again and writes canonical names to Sheets.

## Rejection cases

- unknown guest IDs
- inactive guests
- `needs_review=true`
- `rsvp_required=false`
- duplicate guest IDs
- empty selection
