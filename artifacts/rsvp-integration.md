# RSVP integration

This records the current RSVP contract.

## Visible model

The form collects only:

- attendance
- selected guests from the private registry
- phone
- email
- message

## Payload

```ts
type RsvpPayload = {
  attendance: "yes" | "no";
  selectedGuestIds: string[];
  phone: string;
  email: string;
  message: string;
};
```

## Server behavior

- Search runs server-side against the private registry.
- Submission revalidates every guest ID.
- Canonical names come from the registry, never from the browser.
- The browser never receives the full guest list.

## Apps Script

- `search` returns only `{ guestId, displayName }`
- `submit` accepts only `selectedGuestIds`
- invalid IDs are rejected as a whole
