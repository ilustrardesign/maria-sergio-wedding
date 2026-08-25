import { getSiteUrl } from "@/lib/site";
import type { SelectedGuestAttendance } from "@/lib/guests";

export type RsvpAdminEmailData = {
  email: string;
  message: string;
  phone: string;
  receivedAt: string;
  selectedGuests: SelectedGuestAttendance[];
};

const shell = "margin:0;background:#f7f2e7;color:#373830;font-family:Georgia,'Times New Roman',serif;";
const label = "margin:0 0 4px;color:#747b55;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;";
const value = "margin:0;color:#373830;font-size:16px;line-height:1.55;";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char);
}

function row(title: string, body: string) {
  return `<tr><td style="padding:12px 0;border-bottom:1px solid #e8decb;"><p style="${label}">${title}</p><p style="${value}">${escapeHtml(body || "-")}</p></td></tr>`;
}

function guestSummary(selectedGuests: SelectedGuestAttendance[]) {
  return selectedGuests.map((guest) => `${guest.displayName} — ${guest.attendance === "yes" ? "Presente" : "Não poderá comparecer"}`).join(" | ");
}

export function renderRsvpAdminEmail(data: RsvpAdminEmailData) {
  const guestDisplayNames = guestSummary(data.selectedGuests);
  const subject = `RSVP · ${data.selectedGuests.map((guest) => guest.displayName).join(" + ")}`;
  const siteUrl = getSiteUrl();
  const text = [
    "Maria & Sérgio - Nova confirmação de presença",
    `Convidados: ${guestDisplayNames || "-"}`,
    `Telefone: ${data.phone}`,
    `Email: ${data.email || "-"}`,
    `Recadinho: ${data.message || "-"}`,
    `Data/hora: ${data.receivedAt}`,
  ].join("\n");

  const guestsBlock = data.selectedGuests.length > 0
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;">${data.selectedGuests.map((guest) => `<tr><td style="padding:10px 0;border-top:1px solid #ece1ce;"><p style="margin:0;color:#373830;font-size:16px;line-height:1.55;">${escapeHtml(guest.displayName)}</p><p style="margin:2px 0 0;color:#747b55;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${guest.attendance === "yes" ? "✓ Estará presente" : "— Não poderá comparecer"}</p></td></tr>`).join("")}</table>`
    : `<p style="${value}">-</p>`;

  const html = `<!doctype html><html><body style="${shell}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe4;"><tr><td align="center" style="padding:34px 18px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fbf8f0;border:1px solid #e5dac3;"><tr><td style="padding:34px 32px 22px;text-align:center;border-bottom:1px solid #e5dac3;"><p style="margin:0 0 10px;color:#8f7c46;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Nova confirmação de presença</p><h1 style="margin:0;color:#4a5234;font-size:36px;font-weight:400;line-height:1;">Maria &amp; Sérgio</h1></td></tr><tr><td style="padding:20px 32px 30px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:12px 0;border-bottom:1px solid #e8decb;"><p style="${label}">Convidados</p>${guestsBlock}</td></tr>${row("Telefone", data.phone)}${row("Email", data.email)}${row("Recadinho", data.message)}${row("Data/hora", data.receivedAt)}${row("Convite", siteUrl)}</table></td></tr></table></td></tr></table></body></html>`;

  return { html, subject, text };
}
