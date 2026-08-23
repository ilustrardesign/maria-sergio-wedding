import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { weddingContent } from "@/content/wedding";
import { amountToCents, buildTxid, createPixPayload, isPixConfigured } from "@/lib/pix";

export const runtime = "nodejs";

type PixChargeRequest = {
  amount?: unknown;
  giftId?: unknown;
};

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function resolveGift(source: PixChargeRequest) {
  const giftId = cleanString(source.giftId, 64);
  const gift = weddingContent.gifts.items.find((item) => item.id === giftId);
  if (!gift) return null;

  const amount = gift.customAmount ? cleanString(source.amount, 32) : gift.price;
  const amountCents = amountToCents(amount);
  if (!amountCents) return null;
  if (gift.customAmount && (amountCents < 100 || amountCents > 5000000)) return null;

  return { amountCents, gift };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const resolved = resolveGift(body as PixChargeRequest);

  if (!resolved) {
    return NextResponse.json({ message: "Informe presente e valor válidos." }, { status: 400 });
  }

  const pixConfig = {
    key: process.env.PIX_KEY?.trim() || process.env.PIX_KEY_CPF?.trim(),
    receiverCity: process.env.PIX_RECEIVER_CITY?.trim(),
    receiverName: process.env.PIX_RECEIVER_NAME?.trim(),
  };

  if (!isPixConfigured(pixConfig)) {
    return NextResponse.json({ message: "Pix ainda não configurado." }, { status: 503 });
  }

  const txid = buildTxid(resolved.gift.id);
  const pixCopyPaste = createPixPayload(pixConfig, resolved.amountCents, txid);
  const qrCode = await QRCode.toDataURL(pixCopyPaste, { errorCorrectionLevel: "M", margin: 2, width: 320 });

  return NextResponse.json({
    amount: (resolved.amountCents / 100).toFixed(2),
    giftId: resolved.gift.id,
    giftName: resolved.gift.title,
    pixCopyPaste,
    qrCode,
    txid,
  });
}
