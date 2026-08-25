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

export type GuestSearchResult = GuestSelection;

export type GuestSearchResponse = GuestSearchResult[];

export type GuestSearchApiResponse = {
  guests: GuestSearchResponse;
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
  attendance: "yes" | "no";
  email: string;
  message: string;
  phone: string;
  selectedGuestIds: string[];
};

export type ValidatedGuestSelection = GuestSelection & {
  attendance: "yes" | "no";
};

export const GUEST_SEARCH_MIN_CHARS = 2;
export const GUEST_SEARCH_MAX_RESULTS = 8;

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function normalizeGuestRows(rows: GuestRegistryRow[]) {
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

function guestIsSelectable(row: GuestRegistryRow) {
  return row.active && row.rsvp_required && !row.needs_review && !row.is_baby && !row.is_child;
}

function demoGuestRows(): GuestRegistryRow[] {
  return [
    { active: true, display_name: "Pedro Ivo", guest_id: "demo-pedro", is_child: false, needs_review: false, raw_name: "Pedro Ivo", rsvp_required: true, side: "Noivo" },
    { active: true, display_name: "Katherine", guest_id: "demo-katherine", is_child: false, needs_review: false, raw_name: "Katherine", rsvp_required: true, side: "Noiva" },
    { active: true, display_name: "Maria Teste", guest_id: "demo-maria", is_child: false, needs_review: false, raw_name: "Maria Teste", rsvp_required: true, side: "Amigos" },
    { active: true, display_name: "Lucas", guest_id: "demo-lucas-1", is_child: true, needs_review: false, raw_name: "Lucas*", rsvp_required: false, side: "Família" },
  ];
}

function getRsvpMode() {
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

export function searchGuestRows(rows: GuestRegistryRow[], query: string, limit = GUEST_SEARCH_MAX_RESULTS): GuestSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < GUEST_SEARCH_MIN_CHARS) return [];

  return normalizeGuestRows(rows)
    .filter(guestIsSelectable)
    .filter((row) => {
      const searchable = normalizeSearchText(`${row.display_name} ${row.raw_name}`);
      return searchable.includes(normalizedQuery);
    })
    .slice(0, limit)
    .map((row) => ({ displayName: row.display_name, guestId: row.guest_id }));
}

export function searchDemoGuests(query: string): GuestSearchResult[] {
  return searchGuestRows(demoGuestRows(), query);
}

export function validateSelectedGuestIds(rows: GuestRegistryRow[], selectedGuestIds: string[]) {
  const normalizedRows = normalizeGuestRows(rows);
  const byId = new Map(normalizedRows.map((row) => [row.guest_id, row]));
  const uniqueIds = new Set<string>();
  const selectedGuests: GuestSelection[] = [];

  for (const guestId of selectedGuestIds) {
    const cleanGuestId = cleanText(guestId, 100);
    if (!cleanGuestId || uniqueIds.has(cleanGuestId)) {
      return { ok: false as const };
    }

    const row = byId.get(cleanGuestId);
    if (!row || !guestIsSelectable(row)) {
      return { ok: false as const };
    }

    uniqueIds.add(cleanGuestId);
    selectedGuests.push({ displayName: row.display_name, guestId: row.guest_id });
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
