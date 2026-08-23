import type { RsvpPayload } from "@/lib/rsvp";

export type RsvpAdminEmailData = {
  payload: RsvpPayload;
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

export function renderRsvpAdminEmail({ payload, receivedAt }: RsvpAdminEmailData) {
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();
  const attendance = payload.attendance === "yes" ? "Sim, estará presente" : "Não poderá comparecer";
  const text = [
    "Maria & Sérgio - Nova confirmação de presença",
    `Nome: ${fullName}`,
    `Telefone: ${payload.phone}`,
    `Email: ${payload.email || "-"}`,
    `Presença: ${attendance}`,
    `Convidados: ${payload.guestNames || "-"}`,
    `Recadinho: ${payload.message || "-"}`,
    `Data/hora: ${receivedAt}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="${shell}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2e7;"><tr><td align="center" style="padding:32px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fdfbf6;border:1px solid #e8decb;"><tr><td style="padding:34px 32px 22px;text-align:center;border-bottom:1px solid #e8decb;"><p style="margin:0 0 10px;color:#b49a61;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Nova confirmação de presença</p><h1 style="margin:0;color:#4b5236;font-size:36px;font-weight:400;line-height:1;">Maria &amp; Sérgio</h1></td></tr><tr><td style="padding:20px 32px 30px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Nome e sobrenome", fullName)}${row("Telefone", payload.phone)}${row("Email", payload.email)}${row("Presença", attendance)}${row("Convidados", payload.guestNames)}${row("Recadinho", payload.message)}${row("Data/hora", receivedAt)}</table></td></tr></table></td></tr></table></body></html>`;

  return { html, subject: "Nova confirmação de presença - Maria & Sérgio", text };
}
