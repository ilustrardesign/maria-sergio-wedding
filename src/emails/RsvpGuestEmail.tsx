import { getSiteUrl } from "@/lib/site";
import type { SelectedGuestAttendance } from "@/lib/guests";

export type RsvpGuestEmailData = {
  selectedGuests: SelectedGuestAttendance[];
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char);
}

function firstName(displayName: string) {
  return displayName.split(/\s+/).filter(Boolean)[0] || displayName;
}

function greeting(selectedGuests: SelectedGuestAttendance[]) {
  if (selectedGuests.length === 1) return `Olá, ${firstName(selectedGuests[0].displayName)}.`;
  return "Olá!";
}

function summaryLines(selectedGuests: SelectedGuestAttendance[]) {
  return selectedGuests
    .map((guest) => ({
      label: guest.attendance === "yes" ? "Presença confirmada" : "Não poderá comparecer",
      name: guest.displayName,
    }))
    .map((line) => `<tr><td style="padding:10px 0;border-top:1px solid #e7dcc7;"><p style="margin:0;color:#4a5234;font-size:18px;line-height:1.5;">${escapeHtml(line.name)}</p><p style="margin:2px 0 0;color:#7a7053;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(line.label)}</p></td></tr>`)
    .join("");
}

export function renderRsvpGuestEmail({ selectedGuests }: RsvpGuestEmailData) {
  const attendingCount = selectedGuests.filter((guest) => guest.attendance === "yes").length;
  const allNo = attendingCount === 0;
  const eyebrow = allNo ? "RESPOSTA RECEBIDA" : "PRESENÇA CONFIRMADA";
  const title = allNo
    ? "Recebemos sua resposta"
    : selectedGuests.length === 1 && attendingCount === 1
      ? "Que alegria ter você conosco"
      : "Que alegria ter vocês conosco";
  const body = allNo
    ? `Sentiremos sua falta no nosso grande dia, mas agradecemos muito por nos avisar e, principalmente, por todo o carinho.\n\nEsperamos poder celebrar juntos em outra oportunidade.`
    : selectedGuests.length === 1 && attendingCount === 1
      ? `Recebemos sua confirmação e ficamos muito felizes em saber que você estará conosco.\n\nEstamos preparando cada detalhe com muito carinho, e vai ser uma alegria dividir esse dia com você.`
      : `Recebemos sua confirmação e ficamos muito felizes em saber que vocês estarão conosco.\n\nEstamos preparando cada detalhe com muito carinho, e vai ser uma alegria dividir esse dia com vocês.`;
  const subject = allNo
    ? "Recebemos sua resposta — Maria & Sérgio"
    : selectedGuests.length === 1 && attendingCount === 1
      ? "Que alegria ter você conosco — Maria & Sérgio"
      : "Que alegria ter vocês conosco — Maria & Sérgio";
  const siteUrl = getSiteUrl();
  const text = [
    eyebrow,
    title,
    greeting(selectedGuests),
    body,
    "31 de outubro de 2026",
    "Cabedelo · Paraíba",
    `Ver nosso convite: ${siteUrl}`,
    "Com carinho,",
    "Maria & Sérgio",
  ].join("\n");

  const paragraph = body.split("\n\n").map((line) => `<p style="margin:0 0 18px;font-size:18px;line-height:1.85;">${escapeHtml(line)}</p>`).join("");
  const summary = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 0;">${summaryLines(selectedGuests)}</table>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4efe4;color:#38362f;font-family:Georgia,'Times New Roman',serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe4;"><tr><td align="center" style="padding:36px 18px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fbf8f0;border:1px solid #e5dac3;"><tr><td style="padding:42px 34px 34px;text-align:center;"><p style="margin:0 0 12px;color:#8f7c46;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p><h1 style="margin:0 0 24px;color:#4a5234;font-size:40px;font-weight:400;line-height:1.05;">${escapeHtml(title)}</h1><div style="max-width:470px;margin:0 auto 18px;text-align:left;"><p style="margin:0 0 18px;font-size:18px;line-height:1.85;">${escapeHtml(greeting(selectedGuests))}</p>${paragraph}${summary}</div><p style="margin:0 0 22px;color:#7a7053;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.16em;line-height:1.8;text-transform:uppercase;">31 de outubro de 2026<br />Cabedelo · Paraíba</p><table role="presentation" cellspacing="0" cellpadding="0" align="center"><tr><td style="background:#4b5236;"><a href="${siteUrl}" style="display:inline-block;padding:14px 24px;color:#fbf8f0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.14em;text-decoration:none;text-transform:uppercase;">Ver nosso convite</a></td></tr></table><p style="margin:26px 0 0;font-size:18px;line-height:1.7;">Com carinho,<br />Maria &amp; Sérgio</p></td></tr></table></td></tr></table></body></html>`;

  return { html, subject, text };
}
