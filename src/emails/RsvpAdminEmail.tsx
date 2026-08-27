import { getSiteUrl } from "@/lib/site";
import type { SelectedGuestAttendance } from "@/lib/guests";

export type RsvpAdminEmailData = {
  email: string;
  message: string;
  phone: string;
  receivedAt: string;
  selectedGuests: SelectedGuestAttendance[];
};

const shell = "margin:0;background:#f5f0e4;color:#373830;font-family:Georgia,'Times New Roman',serif;";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char);
}

function labelStyle() {
  return "margin:0 0 4px;color:#7f7449;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;line-height:1.45;text-transform:uppercase;";
}

function valueStyle() {
  return "margin:0;color:#373830;font-size:16px;line-height:1.6;word-break:break-word;";
}

function guestRow(guest: SelectedGuestAttendance) {
  return `<tr><td style="padding:14px 0;border-top:1px solid #e6dcc9;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding-right:16px;vertical-align:top;"><p style="margin:0;color:#404735;font-size:17px;line-height:1.5;">${escapeHtml(guest.displayName)}</p></td><td align="right" style="vertical-align:top;"><span style="display:inline-block;padding:6px 10px;border:1px solid ${guest.attendance === "yes" ? "#a8a06b" : "#8b7f66"};color:${guest.attendance === "yes" ? "#5c653f" : "#7c7159"};font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;line-height:1;text-transform:uppercase;">${guest.attendance === "yes" ? "Estará presente" : "Não poderá comparecer"}</span></td></tr></table></td></tr>`;
}

function guestSummary(selectedGuests: SelectedGuestAttendance[]) {
  return selectedGuests.map((guest) => `${guest.displayName} — ${guest.attendance === "yes" ? "Presente" : "Não poderá comparecer"}`).join(" | ");
}

export function renderRsvpAdminEmail(data: RsvpAdminEmailData) {
  const guestNames = data.selectedGuests.map((guest) => guest.displayName).join(" + ");
  const subject = `RSVP · ${guestNames || "Nova confirmação"}`;
  const siteUrl = getSiteUrl();
  const monogramUrl = `${siteUrl.replace(/\/$/, "")}/images/brand/monogram-email.png`;
  const text = [
    "NOVA CONFIRMAÇÃO DE PRESENÇA",
    `Convidados: ${guestSummary(data.selectedGuests) || "-"}`,
    `Telefone: ${data.phone || "-"}`,
    `Email: ${data.email || "-"}`,
    `Mensagem: ${data.message || "-"}`,
    `Timestamp: ${data.receivedAt || "-"}`,
    `Convite: ${siteUrl}`,
  ].join("\n");

  const rows = [
    `<tr><td style="padding:0 0 12px;"><p style="${labelStyle()}">Convidados</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${data.selectedGuests.map(guestRow).join("") || `<tr><td style="padding:12px 0 0;"><p style="${valueStyle()}">-</p></td></tr>`}</table></td></tr>`,
    `<tr><td style="padding:14px 0;border-top:1px solid #e6dcc9;"><p style="${labelStyle()}">Telefone</p><p style="${valueStyle()}">${escapeHtml(data.phone || "-")}</p></td></tr>`,
    `<tr><td style="padding:14px 0;border-top:1px solid #e6dcc9;"><p style="${labelStyle()}">Email</p><p style="${valueStyle()}">${escapeHtml(data.email || "-")}</p></td></tr>`,
    `<tr><td style="padding:14px 0;border-top:1px solid #e6dcc9;"><p style="${labelStyle()}">Mensagem</p><p style="${valueStyle()}">${escapeHtml(data.message || "-")}</p></td></tr>`,
    `<tr><td style="padding:14px 0;border-top:1px solid #e6dcc9;"><p style="${labelStyle()}">Timestamp</p><p style="${valueStyle()}">${escapeHtml(data.receivedAt || "-")}</p></td></tr>`,
    `<tr><td style="padding:14px 0;border-top:1px solid #e6dcc9;"><p style="${labelStyle()}">Convite</p><p style="${valueStyle()}"><a href="${siteUrl}" style="color:#5c653f;text-decoration:none;">${escapeHtml(siteUrl)}</a></p></td></tr>`,
  ].join("");

  const html = `<!doctype html><html><body style="${shell}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f0e4;"><tr><td align="center" style="padding:34px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;background:#fbf8f0;border:1px solid #e4dac7;"><tr><td style="padding:34px 32px 22px;text-align:center;border-bottom:1px solid #e4dac7;"><img src="${monogramUrl}" width="72" height="72" alt="Maria &amp; Sérgio" style="display:block;width:72px;height:72px;margin:0 auto 18px;object-fit:contain;" /><p style="margin:0 0 10px;color:#8e7a45;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.2em;line-height:1.4;text-transform:uppercase;">NOVA CONFIRMAÇÃO DE PRESENÇA</p><h1 style="margin:0;color:#465036;font-size:36px;font-weight:400;line-height:1.08;">Maria &amp; Sérgio</h1></td></tr><tr><td style="padding:22px 32px 30px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table></td></tr></table></td></tr></table></body></html>`;

  return { html, subject, text };
}
