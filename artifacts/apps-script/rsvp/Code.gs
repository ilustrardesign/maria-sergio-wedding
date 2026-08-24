const GUEST_HEADERS = [
  "guest_id",
  "guardian_guest_id",
  "side",
  "raw_name",
  "display_name",
  "is_baby",
  "rsvp_required",
  "invite_code",
  "invite_url",
  "active",
  "needs_review",
  "notes",
  "created_at",
];

const RESPONSE_HEADERS = [
  "received_at",
  "guest_id",
  "display_name",
  "invite_code_ref",
  "attendance",
  "phone",
  "email",
  "message",
  "side",
  "dependent_guest_ids",
  "dependent_display_names",
  "submitted",
  "notes",
];

const SPREADSHEET_NAME = "RSVP - Casamento Maria e Sérgio - 31-10-2026";
const GUEST_SHEET_NAME = "Convidados";
const RESPONSE_SHEET_NAME = "RSVP";

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
  const baseRows = rows.map((row) => {
    const rawName = clean_(row.raw_name, 180);
    const displayName = normalizeDisplayName_(row.display_name || rawName);
    const isBaby = /\*$/.test(rawName);

    return {
      active: toBoolean_(row.active, true),
      created_at: clean_(row.created_at, 80) || now,
      display_name: displayName,
      guardian_guest_id: clean_(row.guardian_guest_id, 80),
      guest_id: clean_(row.guest_id, 80) || generateToken_(),
      invite_code: isBaby ? "" : clean_(row.invite_code, 120),
      invite_url: "",
      is_baby: isBaby,
      needs_review: toBoolean_(row.needs_review, false),
      notes: clean_(row.notes, 500),
      raw_name: rawName,
      rsvp_required: !isBaby,
      side: clean_(row.side, 40),
    };
  });

  const displayCounts = {};
  baseRows.forEach((row) => {
    if (!row.display_name) return;
    displayCounts[row.display_name] = (displayCounts[row.display_name] || 0) + 1;
  });

  const guestIds = {};
  baseRows.forEach((row) => {
    guestIds[row.guest_id] = true;
  });

  const adultEligibleIds = {};
  baseRows.forEach((row) => {
    const isEligibleAdult =
      !row.is_baby &&
      row.active &&
      !row.needs_review &&
      !!row.display_name &&
      !isPlaceholderName_(row.display_name) &&
      !row.raw_name.includes("?") &&
      (!row.display_name || displayCounts[row.display_name] <= 1);

    if (isEligibleAdult) adultEligibleIds[row.guest_id] = true;
  });

  const reviewRows = [];
  const normalizedRows = baseRows.map((row, index) => {
    const reasons = [];
    if (!row.display_name) reasons.push("nome_vazio");
    if (/\?/.test(row.raw_name)) reasons.push("nome_com_interrogacao");
    if (isPlaceholderName_(row.display_name)) reasons.push("placeholder");
    if (row.display_name && displayCounts[row.display_name] > 1) reasons.push("duplicado_exato");

    const guardianInvalid = row.is_baby && (!row.guardian_guest_id || !guestIds[row.guardian_guest_id] || !adultEligibleIds[row.guardian_guest_id]);
    if (row.is_baby && !row.guardian_guest_id) reasons.push("guardian_ausente");
    if (guardianInvalid) reasons.push("guardian_invalido");

    const needsReview = row.needs_review || reasons.length > 0;
    if (needsReview) {
      reviewRows.push({ reasons: reasons.slice(), row: index + 2 });
    }

    const inviteCode = row.is_baby ? "" : row.invite_code;
    const inviteUrl = row.is_baby ? "" : createInviteUrl_(inviteCode);

    return [
      row.guest_id,
      row.guardian_guest_id,
      row.side,
      row.raw_name,
      row.display_name,
      row.is_baby ? "TRUE" : "FALSE",
      row.rsvp_required ? "TRUE" : "FALSE",
      inviteCode,
      inviteUrl,
      needsReview ? "FALSE" : (row.active ? "TRUE" : "FALSE"),
      needsReview ? "TRUE" : "FALSE",
      joinNotes_(reasons, row.notes),
      row.created_at,
    ];
  });

  if (normalizedRows.length > 0) {
    sheet.getRange(2, 1, normalizedRows.length, GUEST_HEADERS.length).setValues(normalizedRows);
  }

  return {
    ok: true,
    reviewed: reviewRows.length,
    reviewRows: reviewRows,
  };
}

function generateMissingInviteCodes() {
  const spreadsheet = getSpreadsheet_();
  const sheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  ensureHeaders_(sheet, GUEST_HEADERS);

  const rows = readSheetRows_(sheet, GUEST_HEADERS);
  let generated = 0;

  rows.forEach((row, index) => {
    const inviteCode = clean_(row.invite_code, 120);
    const rsvpRequired = toBoolean_(row.rsvp_required, false);
    const needsReview = toBoolean_(row.needs_review, false);
    const active = toBoolean_(row.active, true);
    const isBaby = toBoolean_(row.is_baby, false);
    if (inviteCode || !rsvpRequired || needsReview || !active || isBaby) return;

    const nextCode = generateToken_();
    sheet.getRange(index + 2, GUEST_HEADERS.indexOf("invite_code") + 1).setValue(nextCode);
    sheet.getRange(index + 2, GUEST_HEADERS.indexOf("invite_url") + 1).setValue(createInviteUrl_(nextCode));
    generated += 1;
  });

  return { ok: true, generated: generated };
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
    if (action === "lookup") return handleLookup_(body);
    if (action === "submit") return handleSubmit_(body);

    return json_({ ok: false, message: "Ação inválida." }, 400);
  } catch (error) {
    return json_({ ok: false, message: "Não foi possível processar a requisição." }, 400);
  }
}

function handleLookup_(body) {
  const spreadsheet = getSpreadsheet_();
  const sheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  ensureHeaders_(sheet, GUEST_HEADERS);

  const inviteCode = clean_(body.inviteCode, 120);
  const rows = readSheetRows_(sheet, GUEST_HEADERS);
  const record = findGuestByInviteCode_(rows, inviteCode);
  if (!record) {
    return json_({ ok: false, message: "Não encontrado." }, 404);
  }

  const dependents = findDependentsForGuardian_(rows, record.guest_id);
  return json_({
    ok: true,
    active: record.active,
    displayName: record.display_name,
    dependents: dependents.map((dependent) => ({
      displayName: dependent.display_name,
      guestId: dependent.guest_id,
    })),
    guestId: record.guest_id,
    needsReview: record.needs_review,
    rsvpRequired: record.rsvp_required,
    side: record.side,
  });
}

function handleSubmit_(body) {
  const spreadsheet = getSpreadsheet_();
  const guestsSheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  const responsesSheet = getOrCreateSheet_(spreadsheet, RESPONSE_SHEET_NAME);
  ensureHeaders_(guestsSheet, GUEST_HEADERS);
  ensureHeaders_(responsesSheet, RESPONSE_HEADERS);

  const inviteCode = clean_(body.inviteCode, 120);
  const guestId = clean_(body.guestId, 80);
  const attendance = clean_(body.attendance, 4);
  const phone = clean_(body.phone, 30);
  const email = clean_(body.email, 160);
  const message = clean_(body.message, 800);
  const receivedAt = clean_(body.receivedAt, 80) || new Date().toISOString();

  if (!inviteCode || !guestId || !phone || (attendance !== "yes" && attendance !== "no")) {
    return json_({ ok: false, message: "Campos obrigatórios ausentes." }, 400);
  }

  const guestRows = readSheetRows_(guestsSheet, GUEST_HEADERS);
  const guest = findGuestByInviteCode_(guestRows, inviteCode);
  if (!guest) {
    return json_({ ok: false, message: "Não encontrado." }, 404);
  }

  if (!guest.active || guest.needs_review || !guest.rsvp_required || guest.guest_id !== guestId) {
    return json_({ ok: false, message: "Convite inválido." }, 400);
  }

  const inviteCodeRef = hashInviteCode_(inviteCode);
  const dependents = findDependentsForGuardian_(guestRows, guest.guest_id);
  responsesSheet.appendRow([
    receivedAt,
    guest.guest_id,
    guest.display_name,
    inviteCodeRef,
    attendance,
    phone,
    email,
    message,
    guest.side,
    dependents.map((dependent) => dependent.guest_id).join(","),
    dependents.map((dependent) => dependent.display_name).join(", "),
    "TRUE",
    "",
  ]);

  const notificationEmails = propertiesValue_("RSVP_NOTIFICATION_EMAILS");
  const mailAppEnabled = propertiesValue_("RSVP_MAILAPP_ENABLED") !== "false";
  if (mailAppEnabled && notificationEmails) {
    MailApp.sendEmail({
      to: notificationEmails,
      replyTo: email || undefined,
      subject: "RSVP · " + guest.display_name + " · " + (attendance === "yes" ? "Presença confirmada" : "Não comparecerá"),
      body: [
        "Nome canonical: " + guest.display_name,
        "Lado: " + (guest.side || "-"),
        "Presença: " + (attendance === "yes" ? "Sim, estará presente" : "Não poderá comparecer"),
        "Dependentes: " + (dependents.length > 0 ? dependents.map((dependent) => dependent.display_name).join(", ") : "-"),
        "Telefone: " + phone,
        "Email: " + (email || "-"),
        "Recadinho: " + (message || "-"),
        "Guest ID: " + guest.guest_id,
        "Invite ref: " + inviteCodeRef,
        "Data/hora: " + receivedAt,
      ].join("\n"),
    });
  }

  return json_({ ok: true, submitted: true, id: guest.guest_id });
}

function findGuestByInviteCode_(rows, inviteCode) {
  if (!inviteCode) return null;
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (clean_(row.invite_code, 120) !== inviteCode) continue;
    return row;
  }
  return null;
}

function findDependentsForGuardian_(rows, guardianGuestId) {
  if (!guardianGuestId) return [];
  const guardian = rows.find((row) => clean_(row.guest_id, 80) === guardianGuestId);
  if (!guardian || !isEligibleAdultRow_(guardian, rows)) return [];
  return rows.filter((row) => {
    const isBaby = toBoolean_(row.is_baby, false);
    const active = toBoolean_(row.active, true);
    const needsReview = toBoolean_(row.needs_review, false);
    return isBaby && active && !needsReview && clean_(row.guardian_guest_id, 80) === guardianGuestId && clean_(row.guest_id, 80) !== guardianGuestId;
  });
}

function isEligibleAdultRow_(row, rows) {
  if (!row || toBoolean_(row.is_baby, false)) return false;
  if (!toBoolean_(row.active, true) || toBoolean_(row.needs_review, false)) return false;
  const displayName = clean_(row.display_name, 180);
  const rawName = clean_(row.raw_name, 180);
  if (!displayName || isPlaceholderName_(displayName) || rawName.includes("?")) return false;

  const nameCounts = {};
  rows.forEach((candidate) => {
    const candidateName = clean_(candidate.display_name || candidate.raw_name, 180);
    if (!candidateName) return;
    nameCounts[candidateName] = (nameCounts[candidateName] || 0) + 1;
  });

  return (nameCounts[displayName] || 0) <= 1;
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

function normalizeDisplayName_(value) {
  return clean_(value, 180).replace(/\*+$/g, "").trim();
}

function createInviteUrl_(inviteCode) {
  const normalized = clean_(inviteCode, 120);
  return normalized ? "https://mariaesergio.com/?convite=" + encodeURIComponent(normalized) : "";
}

function isPlaceholderName_(value) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return /(\?|^teste$|^teste /|placeholder|convidado|convidada|a confirmar|a definir|sem nome|pendente|nome do convidado|nome do convidada)/i.test(normalized);
}

function joinNotes_(reasons, existingNotes) {
  const notes = [];
  if (existingNotes) notes.push(clean_(existingNotes, 500));
  if (reasons.length > 0) notes.push("REVIEW: " + reasons.join(","));
  return notes.filter(Boolean).join(" | ").slice(0, 500);
}

function toBoolean_(value, defaultValue) {
  if (value === true || value === "TRUE" || value === "true") return true;
  if (value === false || value === "FALSE" || value === "false") return false;
  return defaultValue;
}

function generateToken_() {
  return Utilities.getUuid().replace(/-/g, "").toLowerCase();
}

function hashInviteCode_(inviteCode) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, inviteCode, Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, "");
}

function propertiesValue_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
