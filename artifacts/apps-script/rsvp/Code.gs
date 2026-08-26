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
  "selected_guest_ids",
  "selected_guest_display_names",
  "selected_guest_attendance",
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
const GUEST_REGISTRY_CACHE_TTL_SECONDS = 300;

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
  invalidateGuestRegistryCache_();

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

  invalidateGuestRegistryCache_();

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

  const rows = getGuestRegistryRowsCached_();
  const results = searchGuests_(rows, query);
  return json_({ ok: true, guests: results });
}

function handleSubmit_(body) {
  const spreadsheet = getSpreadsheet_();
  const guestsSheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  const responsesSheet = getOrCreateSheet_(spreadsheet, RESPONSE_SHEET_NAME);
  ensureHeaders_(guestsSheet, GUEST_HEADERS);
  ensureHeaders_(responsesSheet, RESPONSE_HEADERS);

  const guests = Array.isArray(body.guests)
    ? body.guests.map((guest) => {
        const isObject = guest && typeof guest === "object";
        const attendance = isObject ? clean_(guest.attendance, 4) : "";
        return {
          attendance: attendance === "yes" || attendance === "no" ? attendance : "",
          guestId: isObject ? clean_(guest.guestId, 80) : "",
        };
      })
    : [];
  const phone = clean_(body.phone, 30);
  const email = clean_(body.email, 160);
  const message = clean_(body.message, 800);
  const receivedAt = clean_(body.receivedAt, 80) || new Date().toISOString();

  if (guests.length === 0 || !phone || guests.some((guest) => !guest.guestId || !guest.attendance)) {
    return json_({ ok: false, message: "Campos obrigatórios ausentes." }, 400);
  }

  const guestRows = readSheetRows_(guestsSheet, GUEST_HEADERS);
  const validation = validateGuests_(guestRows, guests);
  if (!validation.ok) {
    return json_({ ok: false, message: "Convidado inválido." }, 400);
  }

  responsesSheet.appendRow([
    receivedAt,
    validation.selectedGuests.map((guest) => guest.guestId).join(","),
    validation.selectedGuests.map((guest) => guest.displayName).join(", "),
    validation.selectedGuests.map((guest) => guest.attendance).join(","),
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
      const words = searchable.split(" ").filter(Boolean);
      return {
        displayName: displayName,
        guestId: clean_(row.guest_id, 80),
        score: searchGuestRank_(searchable, words, normalizedQuery),
      };
    })
    .filter((row) => row.guestId && row.displayName && row.score !== null)
    .sort((a, b) => a.score - b.score || a.displayName.localeCompare(b.displayName))
    .slice(0, MAX_SEARCH_RESULTS)
    .map((row) => ({ guestId: row.guestId, displayName: row.displayName }));
}

function searchGuestRank_(searchable, words, query) {
  if (query.length < MIN_SEARCH_CHARS) return null;

  if (searchable === query) return 0;
  if (searchable.indexOf(query) === 0) return 10;
  for (let index = 0; index < words.length; index += 1) {
    if (words[index].indexOf(query) === 0) return 20;
  }
  if (searchable.indexOf(query) >= 0) return 30;

  if (query.length < 4) return null;

  const maxDistance = query.length <= 5 ? 1 : 2;
  const minimumPrefixLength = query.length <= 5 ? 2 : 3;
  const plausibleTokens = words.filter((token) => token.length >= 4 && Math.abs(token.length - query.length) <= maxDistance + 1);
  let best = maxDistance + 1;
  for (let candidateIndex = 0; candidateIndex < plausibleTokens.length; candidateIndex += 1) {
    const candidate = plausibleTokens[candidateIndex];
    if (!candidate) continue;
    if (candidate.slice(0, minimumPrefixLength) !== query.slice(0, minimumPrefixLength)) continue;
    if (candidate.length > query.length + maxDistance) {
      for (let offset = 0; offset <= candidate.length - query.length; offset += 1) {
        var window = candidate.slice(offset, offset + query.length);
        best = Math.min(best, boundedDistance_(query, window, maxDistance));
        if (best > maxDistance && isSingleAdjacentTransposition_(query, window)) {
          best = 1;
        }
        if (best <= maxDistance) break;
      }
    } else {
      best = Math.min(best, boundedDistance_(query, candidate, maxDistance));
      if (best > maxDistance && isSingleAdjacentTransposition_(query, candidate)) {
        best = 1;
      }
    }
    if (best <= maxDistance) break;
  }

  return best <= maxDistance ? 50 + best : null;
}

function boundedDistance_(source, target, maxDistance) {
  if (Math.abs(source.length - target.length) > maxDistance) return maxDistance + 1;

  const previous = [];
  for (let index = 0; index <= target.length; index += 1) {
    previous.push(index);
  }

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    const current = [sourceIndex];
    let rowMin = sourceIndex;
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost = source.charAt(sourceIndex - 1) === target.charAt(targetIndex - 1) ? 0 : 1;
      const value = Math.min(
        previous[targetIndex] + 1,
        current[targetIndex - 1] + 1,
        previous[targetIndex - 1] + substitutionCost,
      );
      current[targetIndex] = value;
      rowMin = Math.min(rowMin, value);
    }

    if (rowMin > maxDistance) return maxDistance + 1;
    previous.splice(0, previous.length);
    Array.prototype.push.apply(previous, current);
  }

  return previous[target.length];
}

function isSingleAdjacentTransposition_(source, target) {
  if (source.length !== target.length) return false;

  var firstMismatch = -1;
  var secondMismatch = -1;
  for (var index = 0; index < source.length; index += 1) {
    if (source.charAt(index) === target.charAt(index)) continue;
    if (firstMismatch === -1) {
      firstMismatch = index;
      continue;
    }
    if (secondMismatch === -1) {
      secondMismatch = index;
      continue;
    }
    return false;
  }

  return (
    firstMismatch >= 0 &&
    secondMismatch === firstMismatch + 1 &&
    source.charAt(firstMismatch) === target.charAt(secondMismatch) &&
    source.charAt(secondMismatch) === target.charAt(firstMismatch)
  );
}

function validateGuests_(rows, guests) {
  const seen = {};
  const selectedGuests = [];

  for (let index = 0; index < guests.length; index += 1) {
    const guestId = guests[index].guestId;
    const attendance = guests[index].attendance;
    if (!guestId || seen[guestId]) return { ok: false };
    seen[guestId] = true;

    const guest = rows.find((row) => clean_(row.guest_id, 80) === guestId);
    if (!guest || !isSelectableGuest_(guest)) return { ok: false };
    if (attendance !== "yes" && attendance !== "no") return { ok: false };

    selectedGuests.push({
      attendance: attendance,
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

function getGuestRegistryRowsCached_() {
  const spreadsheet = getSpreadsheet_();
  const sheet = getOrCreateSheet_(spreadsheet, GUEST_SHEET_NAME);
  ensureHeaders_(sheet, GUEST_HEADERS);

  const cache = CacheService.getScriptCache();
  const cacheKey = `guest-registry:${spreadsheet.getId()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      // Ignore malformed cache payloads and rebuild from the sheet.
    }
  }

  const rows = readSheetRows_(sheet, GUEST_HEADERS);
  cache.put(cacheKey, JSON.stringify(rows), GUEST_REGISTRY_CACHE_TTL_SECONDS);
  return rows;
}

function invalidateGuestRegistryCache_() {
  const spreadsheet = getSpreadsheet_();
  CacheService.getScriptCache().remove(`guest-registry:${spreadsheet.getId()}`);
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error("Body ausente.");
  return JSON.parse(e.postData.contents);
}

function clean_(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeForSearch_(value) {
  return clean_(value, 180).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
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
