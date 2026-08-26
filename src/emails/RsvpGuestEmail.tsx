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

function isAllYes(selectedGuests: SelectedGuestAttendance[]) {
  return selectedGuests.length > 0 && selectedGuests.every((guest) => guest.attendance === "yes");
}

function isAllNo(selectedGuests: SelectedGuestAttendance[]) {
  return selectedGuests.length > 0 && selectedGuests.every((guest) => guest.attendance === "no");
}

function introCopy(selectedGuests: SelectedGuestAttendance[]) {
  if (isAllYes(selectedGuests)) {
    return selectedGuests.length === 1
      ? "Recebemos sua confirmação e ficamos muito felizes em saber que você estará conosco. Estamos preparando cada detalhe com muito carinho, e vai ser uma alegria dividir esse dia com você."
      : "Recebemos sua confirmação e ficamos muito felizes em saber que vocês estarão conosco. Estamos preparando cada detalhe com muito carinho, e vai ser uma alegria dividir esse dia com vocês.";
  }

  if (isAllNo(selectedGuests)) {
    return "Sentiremos sua falta no nosso grande dia, mas agradecemos muito por nos avisar e, principalmente, por todo o carinho. Esperamos poder celebrar juntos em outra oportunidade.";
  }

  return "Agradecemos por nos avisar e por nos ajudar a preparar tudo com carinho. Recebemos as respostas de cada convidado e registramos tudo com atenção.";
}

function title(selectedGuests: SelectedGuestAttendance[]) {
  if (isAllYes(selectedGuests)) {
    return selectedGuests.length === 1 ? "Que alegria ter você conosco" : "Que alegria ter vocês conosco";
  }
  if (isAllNo(selectedGuests)) {
    return "Recebemos sua resposta";
  }
  return "Recebemos sua confirmação";
}

function eyebrow(selectedGuests: SelectedGuestAttendance[]) {
  if (isAllYes(selectedGuests)) return "PRESENÇA CONFIRMADA";
  if (isAllNo(selectedGuests)) return "RESPOSTA RECEBIDA";
  return "RESPOSTA REGISTRADA";
}

function summaryRow(guest: SelectedGuestAttendance) {
  const label = guest.attendance === "yes" ? "estará presente" : "não poderá comparecer";
  return `<tr><td style="padding:14px 0;border-top:1px solid #e7ddc9;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding-right:16px;vertical-align:top;"><p style="margin:0;color:#404735;font-size:17px;line-height:1.5;">${escapeHtml(guest.displayName)}</p></td><td align="right" style="vertical-align:top;"><span style="display:inline-block;padding:6px 10px;border:1px solid ${guest.attendance === "yes" ? "#a8a06b" : "#8b7f66"};color:${guest.attendance === "yes" ? "#5c653f" : "#7c7159"};font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;line-height:1;text-transform:uppercase;">${escapeHtml(label)}</span></td></tr></table></td></tr>`;
}

export function renderRsvpGuestEmail({ selectedGuests }: RsvpGuestEmailData) {
  const siteUrl = getSiteUrl();
  const siteLink = siteUrl || "https://mariaesergio.com";
  const titleText = title(selectedGuests);
  const eyebrowText = eyebrow(selectedGuests);
  const text = [
    eyebrowText,
    titleText,
    selectedGuests.length === 1 ? `Olá, ${firstName(selectedGuests[0].displayName)}.` : "Olá!",
    introCopy(selectedGuests),
    "",
    ...selectedGuests.map((guest) => `${guest.displayName} — ${guest.attendance === "yes" ? "estará presente" : "não poderá comparecer"}`),
    "",
    "31 de outubro de 2026",
    "Cabedelo · Paraíba",
    `Ver nosso convite: ${siteLink}`,
    "",
    "Com carinho,",
    "Maria & Sérgio",
  ].join("\n");

  const summary = selectedGuests.length > 0
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 0;">${selectedGuests.map(summaryRow).join("")}</table>`
    : "";

  const html = `<!doctype html><html><body style="margin:0;background:#f5f0e4;color:#373830;font-family:Georgia,'Times New Roman',serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f0e4;"><tr><td align="center" style="padding:34px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fbf8f0;border:1px solid #e4dac7;"><tr><td style="padding:38px 34px 28px;text-align:center;"><p style="margin:0 0 12px;color:#8e7a45;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.2em;line-height:1.4;text-transform:uppercase;">${escapeHtml(eyebrowText)}</p><h1 style="margin:0;color:#465036;font-size:40px;font-weight:400;line-height:1.05;">${escapeHtml(titleText)}</h1><div style="max-width:500px;margin:24px auto 0;text-align:left;"><p style="margin:0 0 16px;font-size:18px;line-height:1.8;">${escapeHtml(selectedGuests.length === 1 ? `Olá, ${firstName(selectedGuests[0].displayName)}.` : "Olá!")}</p><p style="margin:0 0 16px;font-size:18px;line-height:1.8;">${escapeHtml(introCopy(selectedGuests))}</p>${summary}</div><p style="margin:26px 0 22px;color:#7a7053;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.16em;line-height:1.8;text-transform:uppercase;">31 de outubro de 2026<br />Cabedelo · Paraíba</p><table role="presentation" cellspacing="0" cellpadding="0" align="center"><tr><td style="background:#4e5539;"><a href="${siteLink}" style="display:inline-block;padding:14px 24px;color:#fbf8f0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.14em;text-decoration:none;text-transform:uppercase;">Ver nosso convite</a></td></tr></table><p style="margin:28px 0 0;font-size:18px;line-height:1.7;">Com carinho,<br />Maria &amp; Sérgio</p></td></tr></table></td></tr></table></body></html>`;

  return { html, subject: titleText, text };
}
