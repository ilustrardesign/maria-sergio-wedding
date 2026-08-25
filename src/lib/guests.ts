export type GuestSelection = {
  displayName: string;
  guestId: string;
};

export type GuestRegistryRow = {
  active: boolean;
  display_name: string;
  guest_id: string;
  guardian_guest_id?: string;
  is_baby?: boolean;
  is_child?: boolean;
  needs_review: boolean;
  raw_name: string;
  rsvp_required: boolean;
  side?: string;
};

export type NormalizedGuestRegistryRow = {
  active: boolean;
  display_name: string;
  guest_id: string;
  guardian_guest_id: string;
  is_baby: boolean;
  is_child: boolean;
  needs_review: boolean;
  raw_name: string;
  rsvp_required: boolean;
  side: string;
};

export type GuestSearchResult = GuestSelection;

export type GuestSearchResponse = GuestSearchResult[];

export type GuestSearchApiResponse = {
  guests: GuestSearchResponse;
};

export type GuestAttendance = "yes" | "no";

export type SelectedGuestAttendance = GuestSelection & {
  attendance: GuestAttendance;
};

export type RsvpGuestSubmission = {
  attendance: GuestAttendance;
  guestId: string;
};

export type GuestSearchRegistryResult =
  | {
      guests: GuestSearchResponse;
      ok: true;
    }
  | {
      message: string;
      ok: false;
      status: number;
    };

export type RsvpSubmissionPayload = {
  email: string;
  guests: RsvpGuestSubmission[];
  message: string;
  phone: string;
};

export const GUEST_SEARCH_MIN_CHARS = 2;
export const GUEST_SEARCH_MAX_RESULTS = 8;

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function normalizeSearchText(value: string) {
  return normalizeGuestSearchTerm(value);
}

export function normalizeGuestSearchTerm(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeGuestRows(rows: GuestRegistryRow[]): NormalizedGuestRegistryRow[] {
  return rows.map((row) => {
    const rawName = cleanText(row.raw_name, 180);
    const displayName = cleanText(row.display_name, 180) || rawName.replace(/\*+$/g, "").trim();
    const isChild = Boolean(row.is_child ?? row.is_baby ?? /\*$/.test(rawName));

    return {
      ...row,
      active: Boolean(row.active),
      display_name: displayName,
      guest_id: cleanText(row.guest_id, 100),
      guardian_guest_id: cleanText(row.guardian_guest_id ?? "", 100),
      is_baby: isChild,
      is_child: isChild,
      needs_review: Boolean(row.needs_review),
      raw_name: rawName,
      rsvp_required: isChild ? false : Boolean(row.rsvp_required),
      side: cleanText(row.side ?? "", 40),
    };
  });
}

function guestIsSelectable(row: NormalizedGuestRegistryRow) {
  return row.active && row.rsvp_required && !row.needs_review && !row.is_baby && !row.is_child;
}

function demoGuestRows(): GuestRegistryRow[] {
  return [
    { active: true, display_name: "Pedro Ivo", guest_id: "demo-pedro", is_child: false, needs_review: false, raw_name: "Pedro Ivo", rsvp_required: true, side: "Noivo" },
    { active: true, display_name: "Katherine", guest_id: "demo-katherine", is_child: false, needs_review: false, raw_name: "Katherine", rsvp_required: true, side: "Noiva" },
    { active: true, display_name: "João Evangelista", guest_id: "demo-joao", is_child: false, needs_review: false, raw_name: "João Evangelista", rsvp_required: true, side: "Demo" },
    { active: true, display_name: "Sérgio Teste", guest_id: "demo-sergio", is_child: false, needs_review: false, raw_name: "Sérgio Teste", rsvp_required: true, side: "Demo" },
    { active: true, display_name: "Catharina Teste", guest_id: "demo-catharina", is_child: false, needs_review: false, raw_name: "Catharina Teste", rsvp_required: true, side: "Demo" },
    { active: true, display_name: "Maria Teste", guest_id: "demo-maria", is_child: false, needs_review: false, raw_name: "Maria Teste", rsvp_required: true, side: "Amigos" },
    { active: true, display_name: "Lucas", guest_id: "demo-lucas-1", is_child: true, needs_review: false, raw_name: "Lucas*", rsvp_required: false, side: "Família" },
  ];
}

export function getDemoGuestRows() {
  return demoGuestRows();
}

export function getRsvpMode() {
  const configuredMode = process.env.NEXT_PUBLIC_RSVP_MODE;
  if (process.env.NODE_ENV === "production") return "endpoint";
  return configuredMode === "demo" || configuredMode === "endpoint" ? configuredMode : "endpoint";
}

function getAppsScriptConfig() {
  return {
    appsScriptUrl: process.env.RSVP_APPS_SCRIPT_URL?.trim(),
    sharedSecret: process.env.RSVP_SHARED_SECRET?.trim(),
  };
}

function boundedDistanceWithin(source: string, target: string, maxDistance: number) {
  if (Math.abs(source.length - target.length) > maxDistance) return maxDistance + 1;

  const previous = Array.from({ length: target.length + 1 }, (_, index) => index);
  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    const current = [sourceIndex];
    let rowMin = current[0];

    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost = source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      const value = Math.min(
        previous[targetIndex] + 1,
        current[targetIndex - 1] + 1,
        previous[targetIndex - 1] + substitutionCost,
      );
      current[targetIndex] = value;
      rowMin = Math.min(rowMin, value);
    }

    if (rowMin > maxDistance) return maxDistance + 1;
    previous.splice(0, previous.length, ...current);
  }

  return previous[target.length];
}

function fuzzyRank(searchable: string, words: string[], query: string) {
  if (query.length < 4) return null;

  const maxDistance = query.length <= 5 ? 2 : 2;
  const candidates = [searchable, ...words].filter((candidate) => candidate.length >= Math.max(3, query.length - maxDistance));
  const bestDistance = candidates.reduce((best, candidate) => {
    if (candidate.length > query.length + maxDistance) {
      const windows = Array.from({ length: candidate.length - query.length + 1 }, (_, index) => candidate.slice(index, index + query.length));
      return Math.min(best, ...windows.map((window) => boundedDistanceWithin(query, window, maxDistance)));
    }

    return Math.min(best, boundedDistanceWithin(query, candidate, maxDistance));
  }, maxDistance + 1);

  return bestDistance <= maxDistance ? 50 + bestDistance : null;
}

function searchRank(row: NormalizedGuestRegistryRow, query: string) {
  const searchable = normalizeGuestSearchTerm(`${row.display_name} ${row.raw_name}`);
  const displayName = normalizeGuestSearchTerm(row.display_name);
  const words = searchable.split(" ").filter(Boolean);

  if (displayName === query || searchable === query) return 0;
  if (displayName.startsWith(query) || searchable.startsWith(query)) return 10;
  if (words.some((word) => word.startsWith(query))) return 20;
  if (searchable.includes(query)) return 30;

  return fuzzyRank(searchable, words, query);
}

export function searchGuestRows(rows: GuestRegistryRow[], query: string, limit = GUEST_SEARCH_MAX_RESULTS): GuestSearchResult[] {
  const normalizedQuery = normalizeGuestSearchTerm(query);
  if (normalizedQuery.length < GUEST_SEARCH_MIN_CHARS) return [];

  return normalizeGuestRows(rows)
    .filter(guestIsSelectable)
    .map((row) => ({ rank: searchRank(row, normalizedQuery), row }))
    .filter((item): item is { rank: number; row: NormalizedGuestRegistryRow } => item.rank !== null)
    .sort((left, right) => {
      if (left.rank !== right.rank) return left.rank - right.rank;
      return left.row.display_name.localeCompare(right.row.display_name, "pt-BR");
    })
    .slice(0, limit)
    .map(({ row }) => ({ displayName: row.display_name, guestId: row.guest_id }));
}

export function searchDemoGuests(query: string): GuestSearchResult[] {
  return searchGuestRows(demoGuestRows(), query);
}

export function validateRsvpGuests(rows: GuestRegistryRow[], guests: RsvpGuestSubmission[]) {
  const normalizedRows = normalizeGuestRows(rows);
  const byId = new Map(normalizedRows.map((row) => [row.guest_id, row]));
  const uniqueIds = new Set<string>();
  const selectedGuests: SelectedGuestAttendance[] = [];

  for (const guest of guests) {
    const cleanGuestId = cleanText(guest?.guestId, 100);
    const attendance = guest?.attendance;
    if (!cleanGuestId || uniqueIds.has(cleanGuestId) || (attendance !== "yes" && attendance !== "no")) {
      return { ok: false as const };
    }

    const row = byId.get(cleanGuestId);
    if (!row || !guestIsSelectable(row)) {
      return { ok: false as const };
    }

    uniqueIds.add(cleanGuestId);
    selectedGuests.push({ attendance, displayName: row.display_name, guestId: row.guest_id });
  }

  if (selectedGuests.length === 0) {
    return { ok: false as const };
  }

  return { ok: true as const, selectedGuests };
}

export async function searchGuestRegistry(query: string): Promise<GuestSearchRegistryResult> {
  const mode = getRsvpMode();
  if (mode === "demo") {
    return { guests: searchDemoGuests(query), ok: true };
  }

  const { appsScriptUrl, sharedSecret } = getAppsScriptConfig();
  if (!appsScriptUrl || !sharedSecret) {
    return { message: "O canal de convidados ainda não está configurado.", ok: false, status: 503 };
  }

  const response = await fetch(appsScriptUrl, {
    body: JSON.stringify({
      action: "search",
      query,
      secret: sharedSecret,
      source: "maria-sergio-site",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const result = (await response.json().catch(() => ({}))) as { guests?: unknown; ok?: boolean; results?: unknown };
  const guests = Array.isArray(result.guests)
    ? result.guests
    : Array.isArray(result.results)
      ? result.results
      : [];

  if (!response.ok || result.ok === false || !Array.isArray(guests)) {
    return { message: "Não foi possível buscar convidados agora.", ok: false, status: response.ok ? 502 : response.status };
  }

  return {
    guests: guests
      .filter((item): item is GuestSelection => Boolean(item) && typeof (item as GuestSelection).guestId === "string" && typeof (item as GuestSelection).displayName === "string")
      .slice(0, GUEST_SEARCH_MAX_RESULTS),
    ok: true,
  };
}

export async function searchGuests(endpoint: string, query: string): Promise<GuestSearchResponse> {
  const response = await fetch(endpoint, {
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) return [];

  const result = (await response.json().catch(() => ({}))) as { guests?: unknown; results?: unknown };
  const guests = Array.isArray(result.guests) ? result.guests : Array.isArray(result.results) ? result.results : [];
  if (!Array.isArray(guests)) return [];

  return guests
    .filter((item): item is GuestSelection => Boolean(item) && typeof (item as GuestSelection).guestId === "string" && typeof (item as GuestSelection).displayName === "string")
    .slice(0, GUEST_SEARCH_MAX_RESULTS);
}
