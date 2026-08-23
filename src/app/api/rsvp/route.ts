import { NextResponse } from "next/server";

import type { RsvpPayload } from "@/lib/rsvp";
import { sendRsvpEmails } from "@/lib/resend";

export const runtime = "nodejs";

type AppsScriptResponse = {
  ok?: boolean;
  message?: string;
  id?: string;
};

const requiredFields: Array<keyof RsvpPayload> = ["firstName", "lastName", "phone", "attendance"];

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function isValidPayload(payload: Partial<RsvpPayload>): payload is RsvpPayload {
  if (!requiredFields.every((field) => payload[field] !== undefined && payload[field] !== "")) return false;
  if (payload.attendance !== "yes" && payload.attendance !== "no") return false;
  if (payload.attendance === "yes" && !payload.guestNames) return false;
  return true;
}

export async function POST(request: Request) {
  const appsScriptUrl = process.env.RSVP_APPS_SCRIPT_URL?.trim();
  const sharedSecret = process.env.RSVP_SHARED_SECRET?.trim();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const source = body as Partial<RsvpPayload>;
  const payload: Partial<RsvpPayload> = {
    attendance: source.attendance,
    email: cleanString(source.email, 160),
    firstName: cleanString(source.firstName, 80),
    guestNames: cleanString(source.guestNames, 500),
    lastName: cleanString(source.lastName, 80),
    message: cleanString(source.message, 800),
    phone: cleanString(source.phone, 25),
  };

  if (!isValidPayload(payload)) {
    return NextResponse.json({ message: "Preencha os dados obrigatórios." }, { status: 400 });
  }

  if (!appsScriptUrl || !sharedSecret) {
    return NextResponse.json(
      {
        mode: "not-configured",
        message: "O canal de confirmação ainda não está configurado.",
      },
      { status: 503 },
    );
  }

  const receivedAt = new Date().toISOString();
  const response = await fetch(appsScriptUrl, {
    body: JSON.stringify({
      payload,
      receivedAt,
      secret: sharedSecret,
      source: "maria-sergio-site",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const result = (await response.json().catch(() => ({}))) as AppsScriptResponse;
  if (!response.ok || result.ok === false) {
    return NextResponse.json(
      { message: result.message ?? "Não foi possível enviar a confirmação." },
      { status: 502 },
    );
  }

  let emailNotificationSent = false;
  try {
    const emailResult = await sendRsvpEmails({ payload, receivedAt });
    emailNotificationSent = emailResult.sent;
  } catch (error) {
    console.error("RSVP email notification failed after persistence", error);
  }

  return NextResponse.json({ emailNotificationSent, id: result.id ?? null, submitted: true });
}
