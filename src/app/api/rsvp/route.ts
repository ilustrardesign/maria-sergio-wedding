import { NextResponse } from "next/server";

import { sendRsvpEmails } from "@/lib/resend";
import { cleanText, getDemoGuestRows, getRsvpMode, type RsvpGuestSubmission, type RsvpSubmissionPayload, validateRsvpGuests } from "@/lib/guests";

export const runtime = "nodejs";

type AppsScriptSubmitResponse = {
  id?: string;
  message?: string;
  ok?: boolean;
  receivedAt?: string;
  selectedGuests?: Array<{ attendance?: "yes" | "no"; displayName?: string; guestId?: string }>;
};

type RsvpApiResponse = {
  adminEmail: "sent" | "failed" | "skipped";
  emailNotificationSent: boolean;
  id: string | null;
  mode: "demo" | "endpoint";
  persisted: boolean;
  guestEmail: "sent" | "failed" | "skipped";
  selectedGuests: Array<{ attendance: "yes" | "no"; displayName: string; guestId: string }>;
  submitted: true;
};

type SanitizedGuest = {
  attendance: "yes" | "no" | "";
  guestId: string;
};

type SanitizedRsvpPayload = {
  email: string;
  guests: SanitizedGuest[];
  hasInvalidGuest: boolean;
  hasDuplicateGuest: boolean;
  message: string;
  phone: string;
};

const genericFailure = "Não foi possível registrar esta confirmação agora. Tente novamente em instantes.";
const configFailure = "O canal de confirmação ainda não está configurado.";
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allowAttempt(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const windowMs = 60_000;
  const maxAttempts = 12;
  const bucket = rateLimit.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
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
  return {
    appsScriptUrl: process.env.RSVP_APPS_SCRIPT_URL?.trim(),
    sharedSecret: process.env.RSVP_SHARED_SECRET?.trim(),
  };
}

function sanitizePayload(body: Partial<RsvpSubmissionPayload> & { guests?: unknown }): SanitizedRsvpPayload {
  const guests: SanitizedGuest[] = Array.isArray(body.guests)
    ? body.guests.map((guest) => {
        const isObject = typeof guest === "object" && guest !== null;
        const attendance = isObject ? (guest as { attendance?: unknown }).attendance : "";
        const guestId = isObject ? cleanText((guest as { guestId?: unknown }).guestId, 120) : "";
        return {
          attendance: attendance === "yes" || attendance === "no" ? attendance : "",
          guestId,
        };
      })
    : [];

  const hasInvalidGuest = guests.some((guest) => !guest.guestId || !guest.attendance);
  const hasDuplicateGuest = new Set(guests.map((guest) => guest.guestId).filter(Boolean)).size !== guests.filter((guest) => guest.guestId).length;
  return {
    email: cleanText(body.email, 160),
    message: cleanText(body.message, 800),
    phone: cleanText(body.phone, 25),
    guests,
    hasInvalidGuest,
    hasDuplicateGuest,
  };
}

export async function POST(request: Request) {
  if (!allowAttempt(request)) {
    return NextResponse.json({ message: genericFailure }, { status: 429 });
  }

  const body = await parseJson(request);
  if (!body) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const payload = sanitizePayload(body as Partial<RsvpSubmissionPayload> & { guests?: unknown });
  if (!payload.phone || payload.guests.length === 0) {
    return NextResponse.json({ message: "Selecione pelo menos um convidado." }, { status: 400 });
  }
  if (payload.hasInvalidGuest || payload.hasDuplicateGuest) {
    return NextResponse.json({ message: "Convidado inválido." }, { status: 400 });
  }

  const mode = getRsvpMode();
  if (mode === "demo") {
    const demoGuests = payload.guests as RsvpGuestSubmission[];
    const validation = validateRsvpGuests(getDemoGuestRows(), demoGuests);
    if (!validation.ok) {
      return NextResponse.json({ message: "Convidado inválido." }, { status: 400 });
    }

    return NextResponse.json({
      adminEmail: "skipped",
      emailNotificationSent: false,
      guestEmail: "skipped",
      id: null,
      mode: "demo",
      persisted: false,
      selectedGuests: validation.selectedGuests,
      submitted: true,
    } satisfies RsvpApiResponse);
  }

  const { appsScriptUrl, sharedSecret } = getAppsScriptConfig();
  if (!appsScriptUrl || !sharedSecret) {
    return NextResponse.json({ message: configFailure }, { status: 503 });
  }

  const receivedAt = new Date().toISOString();
  const submitResponse = await fetch(appsScriptUrl, {
    body: JSON.stringify({
      action: "submit",
      email: payload.email,
      message: payload.message,
      phone: payload.phone,
      receivedAt,
      guests: payload.guests,
      secret: sharedSecret,
      source: "maria-sergio-site",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const submitResult = (await submitResponse.json().catch(() => ({}))) as AppsScriptSubmitResponse;
  if (!submitResponse.ok || submitResult.ok === false || !Array.isArray(submitResult.selectedGuests)) {
    const status = submitResult.ok === false
      ? 400
      : (submitResponse.ok ? 400 : (submitResponse.status >= 400 ? submitResponse.status : 502));
    return NextResponse.json(
      { message: submitResult.message || genericFailure },
      { status },
    );
  }

  const selectedGuests = submitResult.selectedGuests
    .filter((guest) => Boolean(guest) && typeof guest.guestId === "string" && typeof guest.displayName === "string" && (guest.attendance === "yes" || guest.attendance === "no"))
    .map((guest) => ({
      attendance: guest.attendance as "yes" | "no",
      displayName: guest.displayName as string,
      guestId: guest.guestId as string,
    }));
  if (selectedGuests.length === 0) {
    return NextResponse.json({ message: genericFailure }, { status: 502 });
  }

  const emailResult = await sendRsvpEmails({
    email: payload.email,
    message: payload.message,
    phone: payload.phone,
    receivedAt: submitResult.receivedAt ?? receivedAt,
    selectedGuests,
  });

  if (emailResult.admin !== "sent" || emailResult.guest === "failed") {
    console.error("RSVP email delivery status", {
      admin: emailResult.admin,
      guest: emailResult.guest,
      guestIds: selectedGuests.map((guest) => guest.guestId),
    });
  }

  return NextResponse.json({
    adminEmail: emailResult.admin,
    emailNotificationSent: emailResult.guest === "sent",
    guestEmail: emailResult.guest,
    id: submitResult.id ?? null,
    mode: "endpoint",
    persisted: true,
    selectedGuests,
    submitted: true,
  } satisfies RsvpApiResponse);
}
