const HEADERS = [
  "Timestamp",
  "Nome",
  "Sobrenome",
  "Telefone",
  "Email",
  "Presença",
  "Nomes dos convidados",
  "Recadinho para os noivos",
];

const SPREADSHEET_NAME = "RSVP - Casamento Maria e Sérgio - 31-10-2026";
const SHEET_NAME = "RSVP";

function setup() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("RSVP_SPREADSHEET_ID");
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.create(SPREADSHEET_NAME);

  if (!spreadsheetId) {
    properties.setProperty("RSVP_SPREADSHEET_ID", spreadsheet.getId());
  }

  const sheet = getOrCreateSheet_(spreadsheet);
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);

  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    sheetName: sheet.getName(),
  };
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("RSVP_SHARED_SECRET");
    const spreadsheetId = properties.getProperty("RSVP_SPREADSHEET_ID");
    const notificationEmails = properties.getProperty("RSVP_NOTIFICATION_EMAILS");

    if (!expectedSecret || body.secret !== expectedSecret) {
      return json_({ ok: false, message: "Não autorizado." }, 401);
    }

    if (!spreadsheetId) {
      return json_({ ok: false, message: "Planilha RSVP não configurada." }, 500);
    }

    const payload = validatePayload_(body.payload);
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = getOrCreateSheet_(spreadsheet);
    ensureHeaders_(sheet);

    const timestamp = new Date();
    sheet.appendRow([
      timestamp,
      payload.firstName,
      payload.lastName,
      payload.phone,
      payload.email,
      payload.attendance === "yes" ? "Sim" : "Não",
      payload.guestNames,
      payload.message,
    ]);

    if (notificationEmails) {
      MailApp.sendEmail({
        to: notificationEmails,
        subject: `RSVP — Maria e Sérgio — ${payload.firstName} ${payload.lastName}`.trim(),
        body: [
          `Nome: ${payload.firstName} ${payload.lastName}`.trim(),
          `Telefone: ${payload.phone}`,
          `Email: ${payload.email}`,
          `Presença: ${payload.attendance === "yes" ? "Sim" : "Não"}`,
          `Nomes dos convidados: ${payload.guestNames}`,
          `Recadinho: ${payload.message}`,
          `Data/hora: ${timestamp.toISOString()}`,
        ].join("\n"),
      });
    }

    return json_({ ok: true, submitted: true });
  } catch (error) {
    return json_({ ok: false, message: "Não foi possível registrar o RSVP." }, 400);
  }
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error("Body ausente.");
  return JSON.parse(e.postData.contents);
}

function validatePayload_(payload) {
  const cleaned = {
    attendance: clean_(payload && payload.attendance, 3),
    email: clean_(payload && payload.email, 160),
    firstName: clean_(payload && payload.firstName, 80),
    guestNames: clean_(payload && payload.guestNames, 500),
    lastName: clean_(payload && payload.lastName, 80),
    message: clean_(payload && payload.message, 800),
    phone: clean_(payload && payload.phone, 25),
  };

  if (!cleaned.firstName || !cleaned.lastName || !cleaned.phone) throw new Error("Campos obrigatórios.");
  if (cleaned.attendance !== "yes" && cleaned.attendance !== "no") throw new Error("Presença inválida.");
  if (cleaned.attendance === "yes" && !cleaned.guestNames) throw new Error("Convidados obrigatórios.");

  return cleaned;
}

function getOrCreateSheet_(spreadsheet) {
  const existing = spreadsheet.getSheetByName(SHEET_NAME);
  if (existing) return existing;
  const firstSheet = spreadsheet.getSheets()[0];
  if (firstSheet && firstSheet.getLastRow() === 0) {
    firstSheet.setName(SHEET_NAME);
    return firstSheet;
  }
  return spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const values = range.getValues()[0];
  const matches = HEADERS.every((header, index) => values[index] === header);
  if (!matches) {
    range.setValues([HEADERS]);
  }
}

function clean_(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
