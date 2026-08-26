import { renderRsvpAdminEmail } from "@/emails/RsvpAdminEmail";
import { renderRsvpGuestEmail } from "@/emails/RsvpGuestEmail";
import type { SelectedGuestAttendance } from "@/lib/guests";

type RsvpEmailInput = {
  email: string;
  message: string;
  phone: string;
  receivedAt: string;
  selectedGuests: SelectedGuestAttendance[];
};

type RsvpEmailStatus = "sent" | "failed" | "skipped";

type RsvpEmailResult = {
  admin: RsvpEmailStatus;
  guest: RsvpEmailStatus;
  attempted: boolean;
  sent: boolean;
};

type ResendEmail = {
  html: string;
  reply_to?: string[];
  subject: string;
  text: string;
  to: string[];
};

const resendApiUrl = "https://api.resend.com/emails";

export function isResendEnabled() {
  return process.env.RESEND_ENABLED?.trim().toLowerCase() === "true";
}

function splitEmails(value: string | undefined) {
  return (value ?? "").split(",").map((email) => email.trim()).filter(Boolean);
}

function fromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Maria & Sérgio <rsvp@mariaesergio.com>";
}

function defaultReplyTo() {
  return process.env.RESEND_REPLY_TO_EMAIL?.trim() || "rsvp@mariaesergio.com";
}

async function sendEmail(message: ResendEmail, apiKey: string) {
  const response = await fetch(resendApiUrl, {
    body: JSON.stringify({ from: fromEmail(), ...message }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) throw new Error("Resend request failed.");
}

export async function sendRsvpEmails(input: RsvpEmailInput): Promise<RsvpEmailResult> {
  if (!isResendEnabled()) return { attempted: false, admin: "skipped", guest: "skipped", sent: false };

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const admins = splitEmails(process.env.RESEND_ADMIN_EMAILS);
  if (!apiKey) {
    console.warn("Resend enabled but API key is missing; skipping notification emails.");
    return { attempted: false, admin: "skipped", guest: "skipped", sent: false };
  }

  const adminEmail = renderRsvpAdminEmail(input);
  const guestEmail = input.email ? renderRsvpGuestEmail({ selectedGuests: input.selectedGuests }) : null;

  let admin: RsvpEmailStatus = "skipped";
  let guest: RsvpEmailStatus = "skipped";
  let adminSent = false;
  let guestSent = false;
  const tasks: Array<Promise<void>> = [];
  if (admins.length > 0) {
    tasks.push(
      sendEmail({ ...adminEmail, reply_to: input.email ? [input.email] : [defaultReplyTo()], to: admins }, apiKey)
        .then(() => {
          admin = "sent";
          adminSent = true;
        })
        .catch(() => { admin = "failed"; }),
    );
  }

  if (guestEmail && input.email) {
    tasks.push(
      sendEmail({ ...guestEmail, reply_to: [defaultReplyTo()], to: [input.email] }, apiKey)
        .then(() => {
          guest = "sent";
          guestSent = true;
        })
        .catch(() => { guest = "failed"; }),
    );
  }

  if (tasks.length === 0) {
    return { attempted: false, admin, guest, sent: false };
  }

  await Promise.allSettled(tasks);
  return { attempted: true, admin, guest, sent: adminSent || guestSent };
}
