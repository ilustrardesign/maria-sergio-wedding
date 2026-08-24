import { NextResponse } from "next/server";

import { createPublicInviteFailure, isValidInviteCodeFormat, normalizeInviteCode, type InternalInviteRecord } from "@/lib/invite";

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
};

const lookupRateLimit = new Map<string, { count: number; resetAt: number }>();
const publicFailure = createPublicInviteFailure();

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allowAttempt(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const windowMs = 60_000;
  const maxAttempts = 12;
  const bucket = lookupRateLimit.get(key);
  if (!bucket || bucket.resetAt <= now) {
    lookupRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxAttempts) return false;
  bucket.count += 1;
  return true;
}

function getAppsScriptConfig() {
  return {
    appsScriptUrl: process.env.RSVP_APPS_SCRIPT_URL?.trim(),
    sharedSecret: process.env.RSVP_SHARED_SECRET?.trim(),
  };
}

async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!allowAttempt(request)) {
    return NextResponse.json(publicFailure, { status: 429 });
  }

  const body = await parseJson(request);
  const inviteCode = normalizeInviteCode(typeof body?.inviteCode === "string" ? body.inviteCode : "");
  if (!inviteCode || !isValidInviteCodeFormat(inviteCode)) {
    return NextResponse.json(publicFailure);
  }

  const { appsScriptUrl, sharedSecret } = getAppsScriptConfig();
  if (!appsScriptUrl || !sharedSecret) {
    return NextResponse.json(publicFailure, { status: 503 });
  }

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
  if (!response.ok || result.ok === false || result.active === false || result.needsReview || !result.guestId || !result.displayName) {
    return NextResponse.json(publicFailure);
  }

  const record = {
    active: Boolean(result.active),
    displayName: result.displayName,
    dependents: Array.isArray(result.dependents)
      ? result.dependents
          .filter((dependent) => dependent && typeof dependent.guestId === "string" && typeof dependent.displayName === "string")
          .map((dependent) => ({ displayName: dependent.displayName ?? "", guestId: dependent.guestId ?? "" }))
      : [],
    guestId: result.guestId,
    guardianGuestId: undefined,
    inviteCode: undefined,
    inviteUrl: undefined,
    isBaby: false,
    needsReview: Boolean(result.needsReview),
    rsvpRequired: Boolean(result.rsvpRequired),
  } satisfies InternalInviteRecord;

  return NextResponse.json({
    displayName: record.displayName,
    dependents: record.dependents,
    guestId: record.guestId,
    rsvpRequired: record.rsvpRequired,
    valid: true,
  });
}
