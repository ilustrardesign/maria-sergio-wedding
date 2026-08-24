# RSVP Apps Script

Use a Google Account registered with `pedroivo_rcc@hotmail.com` as the owner.

1. Open https://script.google.com and create a new project.
2. Replace `Code.gs` with the version in this folder.
3. In Project Settings > Script Properties, add:
   `RSVP_SHARED_SECRET`: same value configured in `.env.local`.
   `RSVP_NOTIFICATION_EMAILS`: `pedroivo_rcc@hotmail.com,serjolamaria@gmail.com`.
   `RSVP_SPREADSHEET_ID`: leave unset before the first `setup()` run, unless reusing a verified Google Sheet.
   `RSVP_MAILAPP_ENABLED`: optional. Leave unset or `true` while Apps Script still sends email. Set to `false` only after Resend is verified and enabled in the Next.js app.
4. Run `setupGuestsSheet()` once and authorize `SpreadsheetApp` and `MailApp`.
5. Create the private `Convidados` tab only through the script. Do not version real guest rows.
6. Populate `Convidados` manually with these headers:
   `guest_id, guardian_guest_id, side, raw_name, display_name, is_baby, rsvp_required, invite_code, invite_url, active, needs_review, notes, created_at`
7. Run `normalizeGuestRegistry()` to fill `display_name`, mark babies from trailing `*`, require `guardian_guest_id` for babies, set review flags, and keep `raw_name` unchanged.
8. Run `generateMissingInviteCodes()` only after review rows are resolved. It fills codes only for active, RSVP-required guests.
9. Deploy > New deployment > Web app.
10. Set "Execute as" to `Me`.
11. Set access so the Next.js server can POST to the `/exec` URL. If using "Anyone", the shared secret remains required server-to-server.
12. Copy the `/exec` URL into `RSVP_APPS_SCRIPT_URL`.
13. For local email review, open `/api/dev/email-preview?template=guest-yes`, `guest-no`, or `admin` in the Next.js dev server.

Do not put secrets in this folder.

## When Resend Is Activated

1. Verify `mariaesergio.com` in Resend.
2. Configure the Next.js environment variables `RESEND_ENABLED=true`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO_EMAIL`, and `RESEND_ADMIN_EMAILS`.
3. Confirm `/api/rsvp` persists to the Google Sheet before attempting email.
4. In Apps Script Project Settings > Script Properties, set `RSVP_MAILAPP_ENABLED=false`.
5. Create a new Apps Script version and deploy a new Web App deployment.
6. Keep the Google Sheet as the source of truth.
