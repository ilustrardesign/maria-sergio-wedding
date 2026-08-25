import { NextResponse } from "next/server";

import { renderRsvpAdminEmail } from "@/emails/RsvpAdminEmail";
import { renderRsvpGuestEmail } from "@/emails/RsvpGuestEmail";

export const runtime = "nodejs";

function renderPreview(template: string) {
  if (template === "guest-single-yes") {
    return renderRsvpGuestEmail({ selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }] });
  }

  if (template === "guest-mixed") {
    return renderRsvpGuestEmail({ selectedGuests: [{ attendance: "yes", displayName: "Pedro Ivo", guestId: "guest-1" }, { attendance: "no", displayName: "Katherine", guestId: "guest-2" }] });
  }

  if (template === "guest-all-no") {
    return renderRsvpGuestEmail({ selectedGuests: [{ attendance: "no", displayName: "Maria Silva", guestId: "guest-1" }] });
  }

  if (template === "admin-mixed") {
    return renderRsvpAdminEmail({
      email: "maria@example.com",
      message: "Até lá",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Pedro Ivo", guestId: "guest-1" }, { attendance: "no", displayName: "Katherine", guestId: "guest-2" }],
    });
  }

  return null;
}

export function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const template = url.searchParams.get("template") || "guest-single-yes";
  const preview = renderPreview(template);

  if (!preview) {
    return NextResponse.json({ message: "Preview inválido." }, { status: 400 });
  }

  return new Response(preview.html, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
