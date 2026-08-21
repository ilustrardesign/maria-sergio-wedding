# RSVP production checklist

Status: BLOCKED

## Current configuration

- `NEXT_PUBLIC_RSVP_MODE`: SET
- `NEXT_PUBLIC_RSVP_ENDPOINT`: NOT SET
- `RSVP_APPS_SCRIPT_URL`: NOT SET
- `RSVP_SHARED_SECRET`: NOT SET
- `RSVP_NOTIFICATION_EMAIL`: NOT SET

Because `RSVP_APPS_SCRIPT_URL` and `RSVP_SHARED_SECRET` are not configured, no real end-to-end RSVP submission was sent.

## Google Sheet

Status: PASS

- Title: `RSVP - Casamento Maria e Sérgio - 31-10-2026`
- Spreadsheet ID: `1rAdwZRYdEnw6kGtwmSBFlOOkma6gD2vvYJXLUYjxYZ4`
- URL: `https://docs.google.com/spreadsheets/d/1rAdwZRYdEnw6kGtwmSBFlOOkma6gD2vvYJXLUYjxYZ4/edit?usp=drivesdk`
- Tab: `RSVP`
- Header row verified:
  - Timestamp
  - Nome
  - Sobrenome
  - Telefone
  - Email
  - Presença
  - Nomes dos convidados
  - Recadinho para os noivos

## Apps Script required

Status: PENDING USER ACTION

Create and deploy a Google Apps Script Web App connected to the Sheet above.

Script properties required:

- `RSVP_SHEET_ID`: `1rAdwZRYdEnw6kGtwmSBFlOOkma6gD2vvYJXLUYjxYZ4`
- `RSVP_SHEET_NAME`: `RSVP`
- `RSVP_SHARED_SECRET`: same secret configured in the hosting environment
- `RSVP_NOTIFICATION_EMAIL`: email that should receive notifications

Reference implementation:

```js
function doPost(e) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("RSVP_SHARED_SECRET");
    const sheetId = properties.getProperty("RSVP_SHEET_ID");
    const sheetName = properties.getProperty("RSVP_SHEET_NAME");
    const notifyEmail = properties.getProperty("RSVP_NOTIFICATION_EMAIL");

    const body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
    if (!expectedSecret || body.secret !== expectedSecret) {
      return jsonResponse({ ok: false, message: "Unauthorized" }, 401);
    }

    const payload = body.payload || {};
    const required = ["firstName", "lastName", "phone", "attendance"];
    for (const field of required) {
      if (!String(payload[field] || "").trim()) {
        return jsonResponse({ ok: false, message: "Missing field: " + field }, 400);
      }
    }
    if (payload.attendance !== "yes" && payload.attendance !== "no") {
      return jsonResponse({ ok: false, message: "Invalid attendance" }, 400);
    }
    if (payload.attendance === "yes" && !String(payload.guestNames || "").trim()) {
      return jsonResponse({ ok: false, message: "Missing guest names" }, 400);
    }

    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ ok: false, message: "Sheet not found" }, 500);

    const row = [
      new Date(),
      String(payload.firstName || "").trim(),
      String(payload.lastName || "").trim(),
      String(payload.phone || "").trim(),
      String(payload.email || "").trim(),
      payload.attendance === "yes" ? "Sim" : "Não",
      String(payload.guestNames || "").trim(),
      String(payload.message || "").trim(),
    ];
    sheet.appendRow(row);

    if (notifyEmail) {
      MailApp.sendEmail({
        to: notifyEmail,
        subject: "Novo RSVP - Maria e Sérgio",
        body:
          "Nome: " + row[1] + " " + row[2] + "\n" +
          "Telefone: " + row[3] + "\n" +
          "Email: " + row[4] + "\n" +
          "Presença: " + row[5] + "\n" +
          "Convidados: " + row[6] + "\n" +
          "Recadinho: " + row[7],
      });
    }

    return jsonResponse({ ok: true, id: String(sheet.getLastRow()) }, 200);
  } catch (error) {
    return jsonResponse({ ok: false, message: String(error && error.message ? error.message : error) }, 500);
  }
}

function jsonResponse(payload, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(Object.assign({ statusCode: statusCode }, payload)))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Site environment required

Status: PENDING USER ACTION

```env
NEXT_PUBLIC_RSVP_MODE=endpoint
RSVP_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
RSVP_SHARED_SECRET=<same value as Apps Script property>
RSVP_NOTIFICATION_EMAIL=<notification email>
```

## End-to-end test to run after configuration

Status: BLOCKED

Submit a real test RSVP:

- Nome: `TESTE`
- Sobrenome: `CODEX`
- Telefone: `+55 83 99999-0000`
- Email: `teste.codex@example.com`
- Presença: `Sim`
- Nomes dos convidados: `TESTE CODEX`
- Recadinho: `Teste automatizado Codex - pode apagar`

Confirm:

- HTTP success from `/api/rsvp`
- new Sheet row with the exact values above
- MailApp notification received
- UI success message shown
