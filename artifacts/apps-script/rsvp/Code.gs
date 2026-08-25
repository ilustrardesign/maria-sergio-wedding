const GUEST_HEADERS = [
  "guest_id",
  "side",
  "raw_name",
  "display_name",
  "is_child",
  "rsvp_required",
  "active",
  "needs_review",
  "guardian_guest_id",
  "notes",
  "created_at",
];

const RESPONSE_HEADERS = [
  "received_at",
  "attendance",
  "selected_guest_ids",
  "selected_guest_display_names",
  "phone",
  "email",
  "message",
  "submitted",
  "notes",
];

const SPREADSHEET_NAME = "RSVP - Casamento Maria e Sérgio - 31-10-2026";
const GUEST_SHEET_NAME = "Convidados";
const RESPONSE_SHEET_NAME = "RSVP";
const MAX_SEARCH_RESULTS = 8;
const MIN_SEARCH_CHARS = 2;

function setup() {
  return setupGuestsSheet();
}

function setupGuestsSheet() {
  const spreadsheet = getSpreadsheet_();
  const guestsSheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  const responsesSheet = getOrCreateSheet_(spreadsheet, RESPONSE_SHEET_NAME);

  ensureHeaders_(guestsSheet, GUEST_HEADERS);
  ensureHeaders_(responsesSheet, RESPONSE_HEADERS);

  guestsSheet.setFrozenRows(1);
  responsesSheet.setFrozenRows(1);

  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    guestSheetName: guestsSheet.getName(),
    responseSheetName: responsesSheet.getName(),
  };
}

function normalizeGuestRegistry() {
  const spreadsheet = getSpreadsheet_();
  const sheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  ensureHeaders_(sheet, GUEST_HEADERS);

  const rows = readSheetRows_(sheet, GUEST_HEADERS);
  const now = new Date().toISOString();
  const normalizedRows = rows.map((row) => {
    const rawName = clean_(row.raw_name, 180);
    const isChild = toBoolean_(row.is_child, false) || /\*$/.test(rawName);
    const displayName = clean_(row.display_name, 180) || rawName.replace(/\*+$/g, "").trim();
    const needsReview = toBoolean_(row.needs_review, false) || !displayName || /\?/.test(rawName) || isPlaceholderName_(displayName);

    return [
      clean_(row.guest_id, 80) || generateToken_(),
      clean_(row.side, 40),
      rawName,
      displayName,
      isChild ? "TRUE" : "FALSE",
      isChild ? "FALSE" : (toBoolean_(row.rsvp_required, true) ? "TRUE" : "FALSE"),
      toBoolean_(row.active, true) ? "TRUE" : "FALSE",
      needsReview ? "TRUE" : "FALSE",
      clean_(row.guardian_guest_id, 80),
      clean_(row.notes, 500),
      clean_(row.created_at, 80) || now,
    ];
  });

  if (normalizedRows.length > 0) {
    sheet.getRange(2, 1, normalizedRows.length, GUEST_HEADERS.length).setValues(normalizedRows);
  }

  return { ok: true, normalized: normalizedRows.length };
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("RSVP_SHARED_SECRET");

    if (!expectedSecret || body.secret !== expectedSecret) {
      return json_({ ok: false, message: "Não autorizado." }, 401);
    }

    const action = clean_(body.action, 16);
    if (action === "search") return handleSearch_(body);
    if (action === "submit") return handleSubmit_(body);

    return json_({ ok: false, message: "Ação inválida." }, 400);
  } catch (error) {
    return json_({ ok: false, message: "Não foi possível processar a requisição." }, 400);
  }
}

function handleSearch_(body) {
  const query = clean_(body.query, 80);
  if (normalizeForSearch_(query).length < MIN_SEARCH_CHARS) {
    return json_({ ok: true, guests: [] });
  }

  const spreadsheet = getSpreadsheet_();
  const sheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  ensureHeaders_(sheet, GUEST_HEADERS);

  const rows = readSheetRows_(sheet, GUEST_HEADERS);
  const results = searchGuests_(rows, query);
  return json_({ ok: true, guests: results });
}

function handleSubmit_(body) {
  const spreadsheet = getSpreadsheet_();
  const guestsSheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  const responsesSheet = getOrCreateSheet_(spreadsheet, RESPONSE_SHEET_NAME);
  ensureHeaders_(guestsSheet, GUEST_HEADERS);
  ensureHeaders_(responsesSheet, RESPONSE_HEADERS);

  const selectedGuestIds = Array.isArray(body.selectedGuestIds)
    ? body.selectedGuestIds.map((guestId) => clean_(guestId, 80)).filter(Boolean)
    : [];
  const attendance = clean_(body.attendance, 4);
  const phone = clean_(body.phone, 30);
  const email = clean_(body.email, 160);
  const message = clean_(body.message, 800);
  const receivedAt = clean_(body.receivedAt, 80) || new Date().toISOString();

  if (selectedGuestIds.length === 0 || !phone || (attendance !== "yes" && attendance !== "no")) {
    return json_({ ok: false, message: "Campos obrigatórios ausentes." }, 400);
  }

  const guestRows = readSheetRows_(guestsSheet, GUEST_HEADERS);
  const validation = validateSelectedGuestIds_(guestRows, selectedGuestIds);
  if (!validation.ok) {
    return json_({ ok: false, message: "Convidado inválido." }, 400);
  }

  responsesSheet.appendRow([
    receivedAt,
    attendance,
    validation.selectedGuests.map((guest) => guest.guestId).join(","),
    validation.selectedGuests.map((guest) => guest.displayName).join(", "),
    phone,
    email,
    message,
    "TRUE",
    "",
  ]);

  return json_({
    ok: true,
    submitted: true,
    id: generateToken_(),
    receivedAt: receivedAt,
    selectedGuests: validation.selectedGuests,
  });
}

function searchGuests_(rows, query) {
  const normalizedQuery = normalizeForSearch_(query);
  return rows
    .filter(isSelectableGuest_)
    .map((row) => {
      const displayName = clean_(row.display_name, 180);
      const rawName = clean_(row.raw_name, 180);
      const searchable = normalizeForSearch_(displayName + " " + rawName);
      return {
        displayName: displayName,
        guestId: clean_(row.guest_id, 80),
        score: searchable.indexOf(normalizedQuery),
      };
    })
    .filter((row) => row.guestId && row.displayName && row.score >= 0)
    .sort((a, b) => a.score - b.score || a.displayName.localeCompare(b.displayName))
    .slice(0, MAX_SEARCH_RESULTS)
    .map((row) => ({ guestId: row.guestId, displayName: row.displayName }));
}

function validateSelectedGuestIds_(rows, selectedGuestIds) {
  const seen = {};
  const selectedGuests = [];

  for (let index = 0; index < selectedGuestIds.length; index += 1) {
    const guestId = selectedGuestIds[index];
    if (!guestId || seen[guestId]) return { ok: false };
    seen[guestId] = true;

    const guest = rows.find((row) => clean_(row.guest_id, 80) === guestId);
    if (!guest || !isSelectableGuest_(guest)) return { ok: false };

    selectedGuests.push({
      guestId: clean_(guest.guest_id, 80),
      displayName: clean_(guest.display_name, 180),
    });
  }

  if (selectedGuests.length === 0) return { ok: false };
  return { ok: true, selectedGuests: selectedGuests };
}

function isSelectableGuest_(row) {
  const isChild = toBoolean_(row.is_child, false) || /\*$/.test(clean_(row.raw_name, 180));
  return (
    !isChild &&
    toBoolean_(row.active, true) &&
    toBoolean_(row.rsvp_required, false) &&
    !toBoolean_(row.needs_review, false) &&
    !!clean_(row.guest_id, 80) &&
    !!clean_(row.display_name, 180)
  );
}

function readSheetRows_(sheet, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map((row) => headers.reduce((acc, header, index) => {
    acc[header] = row[index];
    return acc;
  }, {}));
}

function ensureHeaders_(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  const values = range.getValues()[0];
  const matches = headers.every((header, index) => values[index] === header);
  if (!matches) {
    range.setValues([headers]);
  }
}

function getSpreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("RSVP_SPREADSHEET_ID");
  const spreadsheet = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.create(SPREADSHEET_NAME);
  if (!spreadsheetId) properties.setProperty("RSVP_SPREADSHEET_ID", spreadsheet.getId());
  return spreadsheet;
}

function getOrCreateSheet_(spreadsheet, name) {
  const existing = spreadsheet.getSheetByName(name);
  if (existing) return existing;
  return spreadsheet.insertSheet(name);
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error("Body ausente.");
  return JSON.parse(e.postData.contents);
}

function clean_(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeForSearch_(value) {
  return clean_(value, 180).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function isPlaceholderName_(value) {
  if (!value) return true;
  const normalized = normalizeForSearch_(value);
  return /(\?|^teste$|^teste |placeholder|convidado|convidada|a confirmar|a definir|sem nome|pendente|nome do convidado|nome da convidada)/i.test(normalized);
}

function toBoolean_(value, defaultValue) {
  if (value === true || value === "TRUE" || value === "true") return true;
  if (value === false || value === "FALSE" || value === "false") return false;
  return defaultValue;
}

function generateToken_() {
  return Utilities.getUuid().replace(/-/g, "").toLowerCase();
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
