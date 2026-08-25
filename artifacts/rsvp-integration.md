# RSVP integration

This records the current RSVP contract.

## Visible model

The form collects only:

- selected guests from the private registry
- individual attendance for each selected guest
- phone
- email
- message

## Payload

```ts
type RsvpPayload = {
  guests: Array<{
    guestId: string;
    attendance: "yes" | "no";
  }>;
  phone: string;
  email: string;
  message: string;
};
```

## Server behavior

- Search runs server-side against the private registry.
- Submission revalidates every guest ID and every attendance value.
- Canonical names come from the registry, never from the browser.
- The browser never receives the full guest list.

## Apps Script

- `search` returns only `{ guestId, displayName }`
- `submit` accepts only `guests: [{ guestId, attendance }]`
- invalid IDs are rejected as a whole
