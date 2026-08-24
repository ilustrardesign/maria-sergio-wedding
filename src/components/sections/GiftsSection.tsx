"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { BotanicalSprig } from "@/components/ui/Botanical";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { GiftItem, GiftsConfig } from "@/types/wedding";

import styles from "./EditorialSections.module.css";

type ChargeState =
  | { status: "idle" }
  | { status: "loading"; gift: GiftItem; amount: string }
  | { status: "ready"; gift: GiftItem; amount: string; txid: string; pixCopyPaste: string; qrCode: string }
  | { status: "error"; gift: GiftItem; amount: string; message: string };

function normalizeAmount(value: string) {
  return value.replace(/[^\d,]/g, "").replace(",", ".");
}

export function GiftsSection({ gifts }: { gifts: GiftsConfig }) {
  const hasPlatform = Boolean(gifts.platform.value?.url);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [charge, setCharge] = useState<ChargeState>({ status: "idle" });
  const [copyMessage, setCopyMessage] = useState("");

  const selectedAmount = useMemo(() => {
    if (!selectedGift) return "";
    return selectedGift.customAmount ? customAmount.trim() : selectedGift.price;
  }, [customAmount, selectedGift]);

  async function prepareCharge(gift: GiftItem) {
    const amount = gift.customAmount ? normalizeAmount(customAmount) : gift.price;
    setCharge({ status: "loading", gift, amount });

    try {
      const response = await fetch("/api/pix/charges", {
        body: JSON.stringify(gift.customAmount ? { amount, giftId: gift.id } : { giftId: gift.id }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message ?? "Não foi possível preparar o Pix.");
      setCharge({
        status: "ready",
        gift,
        amount: data.amount ?? amount,
        pixCopyPaste: data.pixCopyPaste,
        qrCode: data.qrCode,
        txid: data.txid,
      });
    } catch (error) {
      setCharge({
        status: "error",
        gift,
        amount,
        message: error instanceof Error ? error.message : "Não foi possível preparar o Pix.",
      });
    }
  }

  function openGift(gift: GiftItem) {
    setSelectedGift(gift);
    setCustomAmount("");
    setCopyMessage("");
    setCharge({ status: "idle" });
    if (!gift.customAmount) {
      void prepareCharge(gift);
    }
  }

  function closeGift() {
    setSelectedGift(null);
    setCopyMessage("");
    setCharge({ status: "idle" });
  }

  async function copyPixCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopyMessage("Código copiado");
    } catch {
      setCopyMessage("Selecione e copie o código Pix");
    }
  }

  return (
    <section aria-labelledby="gifts-title" className={["section", styles.giftsSection].join(" ")} id="presentes">
      <BotanicalSprig className={styles.giftsBotanical} />
      <div className={["section-inner", styles.giftsInner].join(" ")}>
        <div className={styles.giftsArt} aria-hidden="true" data-reveal>
          <span /><Icon name="gift" size={54} /><i />
        </div>
        <div className={styles.giftsCopy}>
          <SectionHeading align="left" eyebrow={gifts.eyebrow} title={gifts.title} description={gifts.message.value ?? gifts.message.placeholder} />
          <h2 className="sr-only" id="gifts-title">Lista de presentes</h2>
          {hasPlatform ? (
            <a className="button button-primary" href={gifts.platform.value?.url} rel="noreferrer" target="_blank">Abrir lista de presentes</a>
          ) : (
            <div className={styles.pendingGift} data-reveal><Icon name="sparkle" size={18} /><p>{gifts.pendingMessage}</p></div>
          )}
        </div>
      </div>
      {gifts.items.length > 0 ? (
        <div className={["section-inner", styles.giftListWrap].join(" ")}>
          <ol className={styles.giftList} data-reveal>
            {gifts.items.map((item, index) => (
              <li className={[styles.giftItem, item.customAmount ? styles.giftItemCustom : ""].filter(Boolean).join(" ")} key={item.id}>
                <figure
                  className={styles.giftImage}
                  style={{
                    "--gift-image-fit": item.imageFit ?? "cover",
                    "--gift-image-position": item.imagePosition ?? "center",
                  } as CSSProperties}
                >
                  <Image
                    alt={item.image.alt}
                    height={item.image.height}
                    loading="lazy"
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 28vw"
                    src={item.image.src}
                    width={item.image.width}
                  />
                </figure>
                <div className={styles.giftBody}>
                  <span className={styles.giftNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item.title}</p>
                  <strong>{item.price}</strong>
                  {item.description ? <small>{item.description}</small> : null}
                </div>
                <button className={styles.giftButton} onClick={() => openGift(item)} type="button">
                  {item.paymentLabel}
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {selectedGift ? (
        <div aria-labelledby="gift-modal-title" aria-modal="true" className={styles.giftModal} role="dialog">
          <button aria-label="Fechar presente" className={styles.giftModalBackdrop} onClick={closeGift} type="button" />
          <div className={[styles.giftModalPanel, charge.status === "ready" ? styles.giftModalPanelReady : ""].filter(Boolean).join(" ")}>
            <button aria-label="Fechar" className={styles.giftModalClose} onClick={closeGift} type="button">
              <Icon name="close" size={18} />
            </button>
            <div className={charge.status === "ready" ? styles.giftModalReadyGrid : undefined}>
              <div className={styles.giftModalSummary}>
                <span className={styles.giftModalEyebrow}>Enviar presente</span>
                <h3 id="gift-modal-title">{selectedGift.title}</h3>
                <p className={styles.giftModalPrice}>{charge.status === "ready" ? `R$ ${charge.amount.replace(".", ",")}` : selectedGift.price}</p>
                {charge.status === "ready" ? (
                  <p className={styles.giftModalInstruction}>
                    Escaneie o QR Code com o aplicativo do seu banco ou use o Pix Copia e Cola.
                  </p>
                ) : null}
                {selectedGift.customAmount && charge.status !== "ready" ? (
                  <label className={styles.customAmount}>
                    Valor do presente
                    <input
                      inputMode="decimal"
                      onChange={(event) => setCustomAmount(event.target.value)}
                      placeholder="Ex.: 250,00"
                      value={customAmount}
                    />
                  </label>
                ) : null}
                {selectedGift.customAmount && charge.status !== "ready" ? (
                  <button
                    className={styles.giftPayButton}
                    disabled={charge.status === "loading" || !selectedAmount}
                    onClick={() => prepareCharge(selectedGift)}
                    type="button"
                  >
                    {charge.status === "loading" ? "Preparando..." : "Gerar Pix"}
                  </button>
                ) : null}
                {charge.status === "loading" ? <p className={styles.pixLoading}>Preparando seu Pix...</p> : null}
                {charge.status === "error" ? (
                  <div className={styles.pixError} role="status">
                    <p>{charge.message}</p>
                    <button className={styles.pixRetryButton} onClick={() => prepareCharge(charge.gift)} type="button">
                      Tentar novamente
                    </button>
                  </div>
                ) : null}
                <p className={styles.giftFinePrint}>
                  O site não confirma pagamentos automaticamente.
                </p>
              </div>
              {charge.status === "ready" ? (
                <div className={styles.pixState}>
                  <h4>Pix pronto para pagamento</h4>
                  <Image alt="" height={220} src={charge.qrCode} unoptimized width={220} />
                  <strong>R$ {charge.amount.replace(".", ",")}</strong>
                  <input
                    aria-label="Pix Copia e Cola"
                    className={styles.pixPayloadInput}
                    onFocus={(event) => event.currentTarget.select()}
                    readOnly
                    value={charge.pixCopyPaste}
                  />
                  <button className={styles.pixCopyButton} onClick={() => copyPixCode(charge.pixCopyPaste)} type="button">
                    {copyMessage === "Código copiado" ? "Código copiado" : "Copiar código Pix"}
                  </button>
                  <p aria-live="polite" className={styles.pixCopyStatus}>{copyMessage}</p>
                  <small>Após concluir o pagamento no aplicativo do seu banco, você pode fechar esta janela.</small>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
