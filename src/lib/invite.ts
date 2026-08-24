export type InviteLookupRequest = {
  inviteCode: string;
};

export type InviteDependent = {
  displayName: string;
  guestId: string;
};

export type InviteDependentAttendance = InviteDependent & {
  attendance: "yes" | "no";
};

export type InviteLookupResponse =
  | {
      displayName: string;
      dependents: InviteDependent[];
      guestId: string;
      rsvpRequired: boolean;
      valid: true;
    }
  | {
      message: string;
      valid: false;
    };

export type InternalInviteRecord = {
  active: boolean;
  displayName: string;
  dependents: InviteDependent[];
  guestId: string;
  guardianGuestId?: string;
  inviteCode?: string;
  inviteUrl?: string;
  isBaby?: boolean;
  needsReview: boolean;
  rsvpRequired: boolean;
  side?: string;
};

export type GuestRegistryRow = {
  active: boolean;
  created_at: string;
  display_name: string;
  guardian_guest_id: string;
  guest_id: string;
  invite_code: string;
  invite_url: string;
  is_baby: boolean;
  needs_review: boolean;
  notes: string;
  raw_name: string;
  rsvp_required: boolean;
  side: string;
};

export type RsvpSubmissionPayload = {
  attendance: "yes" | "no";
  email: string;
  guestId: string;
  inviteCode: string;
  message: string;
  phone: string;
};

export type InternalInviteValidation = {
  message?: string;
  ok: boolean;
};

export const inviteCodePattern = /^[A-Za-z0-9_-]{12,128}$/;
const placeholderNamePattern = /(\?|^teste$|^teste |placeholder|convidado|convidada|a confirmar|a definir|sem nome|pendente|nome do convidado|nome da convidada)/i;

export function normalizeInviteCode(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export function isValidInviteCodeFormat(value: string) {
  return inviteCodePattern.test(value);
}

export function createPublicInviteFailure(message = "Não encontramos este convite. Confira o código ou fale conosco."): InviteLookupResponse {
  return { message, valid: false };
}

export function createInviteUrl(inviteCode: string) {
  const normalized = normalizeInviteCode(inviteCode);
  return normalized ? `https://mariaesergio.com/?convite=${encodeURIComponent(normalized)}` : "";
}

export function normalizeDisplayName(value: string) {
  return value.replace(/\*+$/g, "").trim();
}

export function isBabyName(value: string) {
  return /\*$/.test(value.trim());
}

export function normalizeGuestRegistryRows(rows: GuestRegistryRow[]): GuestRegistryRow[] {
  const normalizedRows = rows.map((row) => {
    const rawName = row.raw_name.trim();
    const displayName = normalizeDisplayName(row.display_name || rawName);
    const isBaby = isBabyName(rawName);
    const guestId = row.guest_id.trim() || generateGuestId();

    return {
      ...row,
      display_name: displayName,
      guest_id: guestId,
      guardian_guest_id: row.guardian_guest_id.trim(),
      invite_code: isBaby ? "" : normalizeInviteCode(row.invite_code),
      invite_url: "",
      is_baby: isBaby,
      raw_name: rawName,
      rsvp_required: !isBaby,
    };
  });

  const displayCounts = new Map<string, number>();
  normalizedRows.forEach((row) => {
    if (!row.display_name) return;
    displayCounts.set(row.display_name, (displayCounts.get(row.display_name) ?? 0) + 1);
  });

  const guestIds = new Set(normalizedRows.map((row) => row.guest_id).filter(Boolean));
  const adultEligibleIds = new Set(normalizedRows
    .filter((row) => {
      const displayCount = row.display_name ? displayCounts.get(row.display_name) ?? 0 : 0;
      return !row.is_baby && row.active && !row.needs_review && Boolean(row.display_name) && !row.raw_name.includes("?") && !isPlaceholderName(row.display_name) && displayCount <= 1;
    })
    .map((row) => row.guest_id));

  return normalizedRows.map((row) => {
    const displayCount = row.display_name ? displayCounts.get(row.display_name) ?? 0 : 0;
    const guardianInvalid = row.is_baby && (!row.guardian_guest_id || !guestIds.has(row.guardian_guest_id) || !adultEligibleIds.has(row.guardian_guest_id));
    const needsReview =
      row.needs_review ||
      !row.display_name ||
      row.raw_name.includes("?") ||
      isPlaceholderName(row.display_name) ||
      displayCount > 1 ||
      guardianInvalid;

    return {
      ...row,
      active: needsReview ? false : row.active,
      invite_code: row.is_baby ? "" : row.invite_code,
      invite_url: row.is_baby ? "" : createInviteUrl(row.invite_code),
      needs_review: needsReview,
      rsvp_required: row.is_baby ? false : true,
    };
  });
}

function generateGuestId() {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) return randomId.replace(/-/g, "");
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function isPlaceholderName(value: string) {
  return placeholderNamePattern.test(value);
}

export function buildInviteLookupResponse(record: InternalInviteRecord, dependents: InviteDependent[]): InviteLookupResponse {
  return {
    displayName: record.displayName,
    dependents: dependents.filter((dependent) => dependent.guestId !== record.guestId),
    guestId: record.guestId,
    rsvpRequired: record.rsvpRequired,
    valid: true,
  };
}

export function filterDependentsForGuardian(records: InternalInviteRecord[], guardianGuestId: string): InviteDependent[] {
  return records
    .filter((record) => record.isBaby && record.active && !record.needsReview && record.guardianGuestId === guardianGuestId && record.guestId !== guardianGuestId)
    .map((record) => ({ displayName: record.displayName, guestId: record.guestId }));
}

export function deriveDependentAttendance(attendance: "yes" | "no", dependents: InviteDependent[]): InviteDependentAttendance[] {
  return dependents.map((dependent) => ({ ...dependent, attendance }));
}

export function canAttachDependentToGuardian(dependent: InternalInviteRecord | null | undefined, guardianGuestId: string) {
  if (!dependent) return false;
  if (!dependent.isBaby) return false;
  return dependent.guardianGuestId === guardianGuestId;
}

export function canSubmitInvite(
  record: InternalInviteRecord | null | undefined,
  guestId: string,
  inviteCode: string,
  dependents: InviteDependent[] = [],
): InternalInviteValidation {
  if (!record) return { ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." };
  if (!record.active) return { ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." };
  if (record.needsReview) return { ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." };
  if (!record.rsvpRequired) return { ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." };
  if (record.guestId !== guestId) return { ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." };
  if (!isValidInviteCodeFormat(inviteCode)) return { ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." };
  if (dependents.some((dependent) => dependent.guestId === record.guestId)) return { ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." };
  return { ok: true };
}

export async function lookupInvite(inviteCode: string, endpoint = "/api/invite/lookup"): Promise<InviteLookupResponse> {
  if (!endpoint) return createPublicInviteFailure();

  const response = await fetch(endpoint, {
    body: JSON.stringify({ inviteCode }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const result = (await response.json().catch(() => ({}))) as Partial<InviteLookupResponse>;
  if (!response.ok || result.valid !== true) {
    return createPublicInviteFailure();
  }

  return {
    displayName: result.displayName ?? "",
    dependents: Array.isArray((result as { dependents?: InviteDependent[] }).dependents)
      ? (result as { dependents?: InviteDependent[] }).dependents ?? []
      : [],
    guestId: result.guestId ?? "",
    rsvpRequired: Boolean(result.rsvpRequired),
    valid: true,
  };
}
