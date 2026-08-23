import { renderRsvpAdminEmail } from "@/emails/RsvpAdminEmail";
import { renderRsvpGuestEmail } from "@/emails/RsvpGuestEmail";
import type { RsvpPayload } from "@/lib/rsvp";

type RsvpEmailInput = {
  payload: RsvpPayload;
  receivedAt: string;
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

export async function sendRsvpEmails({ payload, receivedAt }: RsvpEmailInput) {
  if (!isResendEnabled()) return { attempted: false, sent: false };

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const admins = splitEmails(process.env.RESEND_ADMIN_EMAILS);
  if (!apiKey || admins.length === 0) return { attempted: false, sent: false };

  const adminEmail = renderRsvpAdminEmail({ payload, receivedAt });
  const guestEmail = payload.email ? renderRsvpGuestEmail({ payload }) : null;
  const replyTo = payload.email ? [payload.email] : [defaultReplyTo()];

  await sendEmail({ ...adminEmail, reply_to: replyTo, to: admins }, apiKey);
  if (guestEmail) {
    await sendEmail({ ...guestEmail, reply_to: [defaultReplyTo()], to: [payload.email] }, apiKey);
  }

  return { attempted: true, sent: true };
}
