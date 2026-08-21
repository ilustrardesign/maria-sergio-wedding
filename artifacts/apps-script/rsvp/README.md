# RSVP Apps Script

Use a Google Account registered with `pedroivo_rcc@hotmail.com` as the owner.

1. Open https://script.google.com and create a new project.
2. Replace `Code.gs` with the version in this folder.
3. In Project Settings > Script Properties, add:
   `RSVP_SHARED_SECRET`: same value configured in `.env.local`.
   `RSVP_NOTIFICATION_EMAILS`: `pedroivo_rcc@hotmail.com,serjolamaria@gmail.com`.
   `RSVP_SPREADSHEET_ID`: leave unset before the first `setup()` run, unless reusing a verified Google Sheet.
4. Run `setup()` manually once and authorize `SpreadsheetApp` and `MailApp`.
5. Confirm the `RSVP` tab has exactly the 8 expected headers and does not overwrite existing data.
6. Deploy > New deployment > Web app.
7. Set "Execute as" to `Me`.
8. Set access so the Next.js server can POST to the `/exec` URL. If using "Anyone", the shared secret remains required server-to-server.
9. Copy the `/exec` URL into `RSVP_APPS_SCRIPT_URL`.

Do not put secrets in this folder.
