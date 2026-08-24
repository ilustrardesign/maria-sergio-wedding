import { getSiteUrl } from "@/lib/site";
import type { InviteDependent } from "@/lib/invite";

export type RsvpAdminEmailData = {
  attendance: "yes" | "no";
  dependents?: InviteDependent[];
  displayName: string;
  email: string;
  guestId: string;
  inviteCodeRef: string;
  message: string;
  phone: string;
  side?: string;
  receivedAt: string;
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

export function renderRsvpAdminEmail(data: RsvpAdminEmailData) {
  const attendance = data.attendance === "yes" ? "Sim, estará presente" : "Não poderá comparecer";
  const dependents = data.dependents ?? [];
  const subject = data.attendance === "yes"
    ? `RSVP · ${data.displayName} · Presença confirmada`
    : `RSVP · ${data.displayName} · Não comparecerá`;
  const siteUrl = getSiteUrl();
  const text = [
    "Maria & Sérgio - Nova confirmação de presença",
    `Nome: ${data.displayName}`,
    `Lado: ${data.side || "-"}`,
    `Guest ID: ${data.guestId}`,
    `Invite ref: ${data.inviteCodeRef}`,
    `Telefone: ${data.phone}`,
    `Email: ${data.email || "-"}`,
    `Presença: ${attendance}`,
    `Dependentes: ${dependents.length > 0 ? dependents.map((dependent) => dependent.displayName).join(", ") : "-"}`,
    `Recadinho: ${data.message || "-"}`,
    `Data/hora: ${data.receivedAt}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="${shell}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe4;"><tr><td align="center" style="padding:34px 18px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fbf8f0;border:1px solid #e5dac3;"><tr><td style="padding:34px 32px 22px;text-align:center;border-bottom:1px solid #e5dac3;"><p style="margin:0 0 10px;color:#8f7c46;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Nova confirmação de presença</p><h1 style="margin:0;color:#4a5234;font-size:36px;font-weight:400;line-height:1;">Maria &amp; Sérgio</h1></td></tr><tr><td style="padding:20px 32px 30px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Nome canonical", data.displayName)}${row("Lado", data.side || "-")}${row("Presença", attendance)}${row("Dependentes", dependents.length > 0 ? dependents.map((dependent) => dependent.displayName).join(", ") : "-")}${row("Telefone", data.phone)}${row("Email", data.email)}${row("Recadinho", data.message)}${row("Guest ID", data.guestId)}${row("Invite ref", data.inviteCodeRef)}${row("Data/hora", data.receivedAt)}${row("Convite", siteUrl)}</table></td></tr></table></td></tr></table></body></html>`;

  return { html, subject, text };
}
