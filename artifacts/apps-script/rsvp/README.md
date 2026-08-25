# RSVP Apps Script

The Apps Script Web App now supports two actions:

- `search`: returns up to 8 guests as `{ guestId, displayName }`
- `submit`: validates every `{ guestId, attendance }` before writing the RSVP row

## Sheet structure

Private registry tab:

`guest_id, side, raw_name, display_name, is_child, rsvp_required, active, needs_review, guardian_guest_id, notes, created_at`

Submission tab:

`received_at, selected_guest_ids, selected_guest_display_names, selected_guest_attendance, phone, email, message, submitted, notes`

## Notes

- Children are excluded from search.
- `needs_review=true` entries are excluded from search.
- The browser never receives the full registry.
- Canonical names stay in the Sheet and are never trusted from the client.
