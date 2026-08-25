"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Monogram } from "@/components/ui/Monogram";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import styles from "./InvitationOpening.module.css";

const SESSION_KEY = "maria-sergio-invitation-open";

type InvitationOpeningProps = {
  monogramSrc?: string;
  onOpen: (fromGesture: boolean) => void;
};

export function InvitationOpening({ monogramSrc, onOpen }: InvitationOpeningProps) {
  const [visible, setVisible] = useState(true);
  const [opening, setOpening] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<{ kill: () => void } | null>(null);
  const reducedMotion = useReducedMotion();

  const completeOpening = useCallback(async (fromGesture: boolean) => {
    if (opening) return;

    setOpening(true);
    window.sessionStorage.setItem(SESSION_KEY, "true");
    onOpen(fromGesture);

    if (reducedMotion) {
      window.setTimeout(() => setVisible(false), 60);
      return;
    }

    const { gsap } = await import("gsap");
    if (!overlayRef.current || !envelopeRef.current || !flapRef.current || !cardRef.current) {
      setVisible(false);
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => setVisible(false),
    });
    animationRef.current = timeline;

    timeline
      .to(flapRef.current, { duration: 0.65, rotateX: -136, y: -2, ease: "power2.inOut" }, 0)
      .to(cardRef.current, { duration: 0.95, yPercent: -32, scale: 1.018, ease: "power3.out" }, 0.22)
      .to(envelopeRef.current, { duration: 0.78, y: -18 }, 0.3)
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.62, ease: "power2.inOut" }, 1.08);
  }, [onOpen, opening, reducedMotion]);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) !== "true") return;
    const frame = window.requestAnimationFrame(() => {
      setVisible(false);
      onOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [onOpen]);

  useEffect(() => {
    document.body.dataset.scrollLocked = visible ? "true" : "false";
    return () => { delete document.body.dataset.scrollLocked; };
  }, [visible]);

  useEffect(() => () => animationRef.current?.kill(), []);

  if (!visible) return null;

  return (
    <>
      <noscript><style>{"#invitation-opening{display:none!important}"}</style></noscript>
      <div
        aria-label="Abertura do convite de casamento"
        className={styles.opening}
        id="invitation-opening"
        ref={overlayRef}
        role="dialog"
      >
        <div aria-hidden="true" className={styles.paperGrain} />
        <div className={styles.scene}>
          <p className={styles.preTitle}>31 · 10 · 2026</p>
          <div className={[styles.envelope, opening ? styles.envelopeOpening : ""].filter(Boolean).join(" ")} ref={envelopeRef}>
            <span aria-hidden="true" className={styles.envelopeBack} />
            <span aria-hidden="true" className={styles.envelopeInterior} />
            <div className={styles.card} ref={cardRef}>
              <Monogram className={styles.monogram} src={monogramSrc} />
              <span aria-hidden="true" className={styles.cardRule} />
              <p>Maria &amp; Sérgio</p>
            </div>
            <span aria-hidden="true" className={styles.envelopeSideLeft} />
            <span aria-hidden="true" className={styles.envelopeSideRight} />
            <span aria-hidden="true" className={styles.envelopeFront} />
            <span aria-hidden="true" className={styles.envelopeFlap} ref={flapRef} />
          </div>
          <button
            aria-label="Abrir convite de Maria e Sérgio"
            className={styles.openButton}
            disabled={opening}
            onClick={() => void completeOpening(true)}
            type="button"
          >
            Abrir convite
          </button>
        </div>
      </div>
    </>
  );
}
