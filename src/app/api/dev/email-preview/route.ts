import { NextResponse } from "next/server";

import { renderRsvpAdminEmail } from "@/emails/RsvpAdminEmail";
import { renderRsvpGuestEmail } from "@/emails/RsvpGuestEmail";

export const runtime = "nodejs";

function renderPreview(template: string) {
  if (template === "guest-yes") {
    return renderRsvpGuestEmail({ attendance: "yes", firstName: "Maria" });
  }

  if (template === "guest-no") {
    return renderRsvpGuestEmail({ attendance: "no", firstName: "Maria" });
  }

  if (template === "admin") {
    return renderRsvpAdminEmail({
      attendance: "yes",
      displayName: "Maria Silva",
      email: "maria@example.com",
      guestId: "guest-1",
      inviteCodeRef: "preview-ref",
      message: "Até lá",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      side: "Maria",
    });
  }

  return null;
}

export function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const template = url.searchParams.get("template") || "guest-yes";
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
