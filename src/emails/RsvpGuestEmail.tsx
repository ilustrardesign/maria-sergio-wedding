import type { RsvpPayload } from "@/lib/rsvp";

export type RsvpGuestEmailData = {
  payload: RsvpPayload;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char);
}

export function renderRsvpGuestEmail({ payload }: RsvpGuestEmailData) {
  const attending = payload.attendance === "yes";
  const response = attending ? "Presença confirmada" : "Ausência registrada";
  const body = attending
    ? "Recebemos sua confirmação. Que alegria saber que você estará conosco."
    : "Recebemos sua resposta. Sentiremos sua falta, mas agradecemos muito por nos avisar.";
  const text = [
    "Maria & Sérgio",
    body,
    "31 de outubro de 2026",
    "Cabedelo · Paraíba",
    `Resposta registrada: ${response}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f7f2e7;color:#373830;font-family:Georgia,'Times New Roman',serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2e7;"><tr><td align="center" style="padding:32px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fdfbf6;border:1px solid #e8decb;"><tr><td style="padding:36px 32px;text-align:center;"><p style="margin:0 0 12px;color:#b49a61;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">${escapeHtml(response)}</p><h1 style="margin:0 0 22px;color:#4b5236;font-size:38px;font-weight:400;line-height:1;">Maria &amp; Sérgio</h1><p style="margin:0 auto 24px;max-width:420px;font-size:17px;line-height:1.7;">${escapeHtml(body)}</p><p style="margin:0;color:#747b55;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">31 de outubro de 2026<br />Cabedelo · Paraíba</p></td></tr></table></td></tr></table></body></html>`;

  return { html, subject: "Resposta registrada - Maria & Sérgio", text };
}
