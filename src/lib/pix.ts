import crypto from "node:crypto";

export type PixChargeResponse = {
  amount: string;
  giftId: string;
  giftName: string;
  pixCopyPaste: string;
  qrCode: string;
  txid: string;
};

export type PixConfig = {
  key: string;
  receiverCity: string;
  receiverName: string;
};

export function amountToCents(amount: string) {
  const normalized = amount.trim().startsWith("R$")
    ? amount.replace(/[R$\s.]/g, "").replace(",", ".")
    : amount.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

export function centsToPixAmount(cents: number) {
  if (!Number.isInteger(cents) || cents <= 0) throw new Error("Valor Pix inválido.");
  return (cents / 100).toFixed(2);
}

export function buildTxid(giftId: string, suffix = crypto.randomBytes(4).toString("hex").toUpperCase()) {
  const base = stripAccents(giftId).replace(/[^A-Z0-9]/g, "").slice(0, 21);
  return `MS${base}${suffix.replace(/[^A-Z0-9]/g, "").slice(0, 10)}`.slice(0, 35);
}

export function isPixConfigured(config: Partial<PixConfig>): config is PixConfig {
  return Boolean(config.key?.trim() && config.receiverName?.trim() && config.receiverCity?.trim());
}

export function createPixPayload(config: PixConfig, amountCents: number, txid: string) {
  const key = config.key.trim();
  const receiverName = sanitizeText(config.receiverName, 25);
  const receiverCity = sanitizeText(config.receiverCity, 15);
  const reference = sanitizeTxid(txid);

  if (!key) throw new Error("Chave Pix inválida.");
  if (!receiverName || !receiverCity) throw new Error("Dados Pix incompletos.");

  const merchantAccount = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", key);
  const additionalData = tlv("05", reference);
  const payloadWithoutCrc = [
    tlv("00", "01"),
    tlv("01", "12"),
    tlv("26", merchantAccount),
    tlv("52", "0000"),
    tlv("53", "986"),
    tlv("54", centsToPixAmount(amountCents)),
    tlv("58", "BR"),
    tlv("59", receiverName),
    tlv("60", receiverCity),
    tlv("62", additionalData),
    "6304",
  ].join("");

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

export function tlv(id: string, value: string) {
  const length = Buffer.byteLength(value, "utf8");
  if (!/^\d{2}$/.test(id) || length > 99) throw new Error("TLV inválido.");
  return `${id}${String(length).padStart(2, "0")}${value}`;
}

export function crc16(value: string) {
  let crc = 0xffff;
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitizeTxid(value: string) {
  const sanitized = stripAccents(value).replace(/[^A-Z0-9]/g, "").slice(0, 35);
  if (!sanitized) throw new Error("TXID inválido.");
  return sanitized;
}

function sanitizeText(value: string, maxLength: number) {
  return stripAccents(value).replace(/[^A-Z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
