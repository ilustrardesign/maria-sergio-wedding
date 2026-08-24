import { getSiteUrl } from "@/lib/site";

export type RsvpGuestEmailData = {
  attendance: "yes" | "no";
  firstName: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char);
}

export function renderRsvpGuestEmail({ attendance, firstName }: RsvpGuestEmailData) {
  const attending = attendance === "yes";
  const eyebrow = attending ? "PRESENÇA CONFIRMADA" : "RESPOSTA RECEBIDA";
  const title = attending ? "Que alegria ter você conosco" : "Recebemos sua resposta";
  const body = attending
    ? `Olá, ${firstName}.\n\nRecebemos sua confirmação e ficamos muito felizes em saber que você estará conosco.\n\nEstamos preparando cada detalhe com muito carinho, e vai ser uma alegria dividir esse dia com você.`
    : `Olá, ${firstName}.\n\nSentiremos sua falta no nosso grande dia, mas agradecemos muito por nos avisar e por todo o carinho.\n\nEsperamos poder celebrar juntos em outra oportunidade.`;
  const subject = attending
    ? "Que alegria ter você conosco — Maria & Sérgio"
    : "Recebemos sua resposta — Maria & Sérgio";
  const siteUrl = getSiteUrl();
  const text = [
    eyebrow,
    title,
    body,
    "31 de outubro de 2026",
    "Cabedelo · Paraíba",
    `Ver nosso convite: ${siteUrl}`,
    "Com carinho,",
    "Maria & Sérgio",
  ].join("\n");

  const paragraph = body.split("\n\n").map((line) => `<p style="margin:0 0 18px;font-size:18px;line-height:1.85;">${escapeHtml(line)}</p>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f4efe4;color:#38362f;font-family:Georgia,'Times New Roman',serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe4;"><tr><td align="center" style="padding:36px 18px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fbf8f0;border:1px solid #e5dac3;"><tr><td style="padding:42px 34px 34px;text-align:center;"><p style="margin:0 0 12px;color:#8f7c46;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p><h1 style="margin:0 0 24px;color:#4a5234;font-size:40px;font-weight:400;line-height:1.05;">${escapeHtml(title)}</h1><div style="max-width:470px;margin:0 auto 26px;text-align:left;">${paragraph}</div><p style="margin:0 0 22px;color:#7a7053;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.16em;line-height:1.8;text-transform:uppercase;">31 de outubro de 2026<br />Cabedelo · Paraíba</p><table role="presentation" cellspacing="0" cellpadding="0" align="center"><tr><td style="background:#4b5236;"><a href="${siteUrl}" style="display:inline-block;padding:14px 24px;color:#fbf8f0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.14em;text-decoration:none;text-transform:uppercase;">Ver nosso convite</a></td></tr></table><p style="margin:26px 0 0;font-size:18px;line-height:1.7;">Com carinho,<br />Maria &amp; Sérgio</p></td></tr></table></td></tr></table></body></html>`;

  return { html, subject, text };
}
