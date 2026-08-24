import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { canSubmitInvite, isValidInviteCodeFormat, normalizeInviteCode, type InternalInviteRecord, type RsvpSubmissionPayload } from "@/lib/invite";
import { sendRsvpEmails } from "@/lib/resend";

export const runtime = "nodejs";

type AppsScriptLookupResponse = {
  active?: boolean;
  displayName?: string;
  dependents?: Array<{
    displayName?: string;
    guestId?: string;
  }>;
  guestId?: string;
  needsReview?: boolean;
  ok?: boolean;
  rsvpRequired?: boolean;
  side?: string;
};

type AppsScriptSubmitResponse = {
  id?: string;
  ok?: boolean;
};

const genericFailure = "Não foi possível registrar este convite agora. Tente novamente em instantes.";
const lookupFailure = "Não encontramos este convite. Confira o código ou fale conosco.";
const inviteRateLimit = new Map<string, { count: number; resetAt: number }>();

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allowAttempt(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const windowMs = 60_000;
  const maxAttempts = 12;
  const bucket = inviteRateLimit.get(key);
  if (!bucket || bucket.resetAt <= now) {
    inviteRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxAttempts) return false;
  bucket.count += 1;
  return true;
}

async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getAppsScriptConfig() {
  const appsScriptUrl = process.env.RSVP_APPS_SCRIPT_URL?.trim();
  const sharedSecret = process.env.RSVP_SHARED_SECRET?.trim();
  return { appsScriptUrl, sharedSecret };
}

function inviteCodeRef(inviteCode: string) {
  return crypto.createHash("sha256").update(inviteCode).digest("hex").slice(0, 12);
}

async function lookupInviteRecord(inviteCode: string) {
  const { appsScriptUrl, sharedSecret } = getAppsScriptConfig();
  if (!appsScriptUrl || !sharedSecret) return { ok: false as const, message: "O canal de convite ainda não está configurado." };

  const response = await fetch(appsScriptUrl, {
    body: JSON.stringify({
      action: "lookup",
      inviteCode,
      secret: sharedSecret,
      source: "maria-sergio-site",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const result = (await response.json().catch(() => ({}))) as AppsScriptLookupResponse;
  if (!response.ok || result.ok === false || !result.guestId || !result.displayName) {
    return { ok: false as const, message: lookupFailure };
  }

  return {
    ok: true as const,
    record: {
      active: Boolean(result.active),
      displayName: result.displayName,
      dependents: Array.isArray(result.dependents)
        ? result.dependents
            .filter((dependent) => dependent && typeof dependent.guestId === "string" && typeof dependent.displayName === "string")
            .map((dependent) => ({ displayName: dependent.displayName ?? "", guestId: dependent.guestId ?? "" }))
        : [],
      guestId: result.guestId,
      needsReview: Boolean(result.needsReview),
      rsvpRequired: Boolean(result.rsvpRequired),
      side: result.side,
    } satisfies InternalInviteRecord,
  };
}

export async function POST(request: Request) {
  if (!allowAttempt(request)) {
    return NextResponse.json({ message: lookupFailure }, { status: 429 });
  }

  const body = await parseJson(request);
  if (!body) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const source = body as Partial<RsvpSubmissionPayload> & { inviteCode?: unknown };
  if (source.attendance !== "yes" && source.attendance !== "no") {
    return NextResponse.json({ message: "Preencha os dados obrigatórios." }, { status: 400 });
  }
  const payload: RsvpSubmissionPayload = {
    attendance: source.attendance,
    email: cleanString(source.email, 160),
    guestId: cleanString(source.guestId, 120),
    inviteCode: normalizeInviteCode(cleanString(source.inviteCode, 128)),
    message: cleanString(source.message, 800),
    phone: cleanString(source.phone, 25),
  };

  if (!payload.inviteCode || !isValidInviteCodeFormat(payload.inviteCode)) {
    return NextResponse.json({ message: lookupFailure }, { status: 400 });
  }

  if (!payload.guestId || !payload.phone) {
    return NextResponse.json({ message: "Preencha os dados obrigatórios." }, { status: 400 });
  }

  const lookup = await lookupInviteRecord(payload.inviteCode);
  if (!lookup.ok) {
    return NextResponse.json({ message: lookup.message }, { status: 404 });
  }

  const validation = canSubmitInvite(lookup.record, payload.guestId, payload.inviteCode);
  if (!validation.ok) {
    return NextResponse.json({ message: validation.message ?? lookupFailure }, { status: 400 });
  }

  const { appsScriptUrl, sharedSecret } = getAppsScriptConfig();
  if (!appsScriptUrl || !sharedSecret) {
    return NextResponse.json({ message: genericFailure }, { status: 503 });
  }

  const receivedAt = new Date().toISOString();
  const submitResponse = await fetch(appsScriptUrl, {
    body: JSON.stringify({
      action: "submit",
      attendance: payload.attendance,
      email: payload.email,
      guestId: payload.guestId,
      inviteCode: payload.inviteCode,
      message: payload.message,
      phone: payload.phone,
      receivedAt,
      secret: sharedSecret,
      source: "maria-sergio-site",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const submitResult = (await submitResponse.json().catch(() => ({}))) as AppsScriptSubmitResponse;
  if (!submitResponse.ok || submitResult.ok === false) {
    return NextResponse.json({ message: genericFailure }, { status: 502 });
  }

  const emailResult = await sendRsvpEmails({
    attendance: payload.attendance,
    dependents: lookup.record.dependents,
    displayName: lookup.record.displayName,
    email: payload.email,
    guestId: payload.guestId,
    inviteCodeRef: inviteCodeRef(payload.inviteCode),
    message: payload.message,
    phone: payload.phone,
    receivedAt,
    side: lookup.record.side,
  });

  if (emailResult.admin !== "sent" || emailResult.guest === "failed") {
    console.error("RSVP email delivery status", {
      admin: emailResult.admin,
      guest: emailResult.guest,
      guestId: payload.guestId,
      inviteCodeRef: inviteCodeRef(payload.inviteCode),
    });
  }

  return NextResponse.json({ id: submitResult.id ?? null, submitted: true });
}
