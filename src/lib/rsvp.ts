import type { RsvpSubmissionPayload } from "@/lib/guests";

export type RsvpPayload = RsvpSubmissionPayload;

export type RsvpResult =
  | {
      adminEmail: "skipped";
      emailNotificationSent: false;
      guestEmail: "skipped";
      id: string | null;
      mode: "demo";
      persisted: false;
      submitted: true;
    }
  | {
      adminEmail: "sent" | "failed" | "skipped";
      emailNotificationSent: boolean;
      guestEmail: "sent" | "failed" | "skipped";
      id: string | null;
      mode: "endpoint";
      persisted: true;
      submitted: true;
    };

export async function submitRsvp(payload: RsvpPayload, endpoint = "/api/rsvp"): Promise<RsvpResult> {
  if (!endpoint.trim()) {
    return {
      adminEmail: "skipped",
      emailNotificationSent: false,
      guestEmail: "skipped",
      id: null,
      mode: "demo",
      persisted: false,
      submitted: true,
    };
  }

  const response = await fetch(endpoint, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Não foi possível enviar sua confirmação agora. Tente novamente em instantes.");
  }

  const result = (await response.json().catch(() => ({}))) as {
    adminEmail?: "sent" | "failed" | "skipped";
    emailNotificationSent?: boolean;
    guestEmail?: "sent" | "failed" | "skipped";
    id?: string | null;
    mode?: "demo" | "endpoint";
    persisted?: boolean;
  };

  if (result.mode === "demo") {
    return {
      adminEmail: "skipped",
      emailNotificationSent: false,
      guestEmail: "skipped",
      id: result.id ?? null,
      mode: "demo",
      persisted: false,
      submitted: true,
    };
  }

  if ("persisted" in result && result.persisted !== true) {
    throw new Error("A confirmação não foi persistida.");
  }

  return {
    adminEmail: result.adminEmail ?? "skipped",
    emailNotificationSent: result.emailNotificationSent ?? false,
    guestEmail: result.guestEmail ?? "skipped",
    id: result.id ?? null,
    mode: "endpoint",
    persisted: true,
    submitted: true,
  };
}
