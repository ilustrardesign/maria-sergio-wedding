import { NextResponse } from "next/server";

import { sendRsvpEmails } from "@/lib/resend";
import { cleanText, type GuestSelection, type RsvpSubmissionPayload } from "@/lib/guests";

export const runtime = "nodejs";

type AppsScriptSubmitResponse = {
  id?: string;
  message?: string;
  ok?: boolean;
  receivedAt?: string;
  selectedGuests?: GuestSelection[];
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

function sanitizePayload(body: Partial<RsvpSubmissionPayload> & { selectedGuestIds?: unknown }) {
  const selectedGuestIds = Array.isArray(body.selectedGuestIds)
    ? body.selectedGuestIds.map((guestId) => cleanText(guestId, 120)).filter(Boolean)
    : [];
  const attendance = body.attendance === "yes" || body.attendance === "no" ? body.attendance : "yes";

  return {
    attendance,
    email: cleanText(body.email, 160),
    message: cleanText(body.message, 800),
    phone: cleanText(body.phone, 25),
    selectedGuestIds,
  } satisfies RsvpSubmissionPayload;
}

export async function POST(request: Request) {
  if (!allowAttempt(request)) {
    return NextResponse.json({ message: genericFailure }, { status: 429 });
  }

  const body = await parseJson(request);
  if (!body) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  if (body.attendance !== "yes" && body.attendance !== "no") {
    return NextResponse.json({ message: "Preencha os dados obrigatórios." }, { status: 400 });
  }

  const payload = sanitizePayload(body as Partial<RsvpSubmissionPayload> & { selectedGuestIds?: unknown });
  if (!payload.phone || payload.selectedGuestIds.length === 0) {
    return NextResponse.json({ message: "Selecione pelo menos um convidado." }, { status: 400 });
  }

  const { appsScriptUrl, sharedSecret } = getAppsScriptConfig();
  if (!appsScriptUrl || !sharedSecret) {
    return NextResponse.json({ message: configFailure }, { status: 503 });
  }

  const receivedAt = new Date().toISOString();
  const submitResponse = await fetch(appsScriptUrl, {
    body: JSON.stringify({
      action: "submit",
      attendance: payload.attendance,
      email: payload.email,
      message: payload.message,
      phone: payload.phone,
      receivedAt,
      selectedGuestIds: payload.selectedGuestIds,
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

  const selectedGuests = submitResult.selectedGuests.filter((guest): guest is GuestSelection => Boolean(guest) && typeof guest.guestId === "string" && typeof guest.displayName === "string");
  if (selectedGuests.length === 0) {
    return NextResponse.json({ message: genericFailure }, { status: 502 });
  }

  const emailResult = await sendRsvpEmails({
    attendance: payload.attendance,
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
      selectedGuestIds: selectedGuests.map((guest) => guest.guestId),
    });
  }

  return NextResponse.json({ id: submitResult.id ?? null, submitted: true });
}
