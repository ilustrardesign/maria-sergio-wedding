"use client";

import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Monogram } from "@/components/ui/Monogram";

import styles from "./InvitationOpening.module.css";

const SESSION_KEY = "maria-sergio-invitation-open";
const OPEN_THRESHOLD = 0.42;

type InvitationOpeningProps = {
  monogramSrc?: string;
  onOpen: (fromGesture: boolean) => void;
};

type DragState = {
  active: boolean;
  moved: boolean;
  pointerId: number;
  startX: number;
  startY: number;
};

export function InvitationOpening({ monogramSrc, onOpen }: InvitationOpeningProps) {
  const [visible, setVisible] = useState(true);
  const [opening, setOpening] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const invitationRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLButtonElement>(null);
  const bowLeftRef = useRef<HTMLSpanElement>(null);
  const bowRightRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<{ kill: () => void } | null>(null);
  const dragRef = useRef<DragState>({ active: false, moved: false, pointerId: -1, startX: 0, startY: 0 });
  const reducedMotion = useReducedMotion();

  const completeOpening = useCallback(async (fromGesture: boolean) => {
    if (opening) return;

    setOpening(true);
    window.sessionStorage.setItem(SESSION_KEY, "true");
    onOpen(fromGesture);

    if (reducedMotion) {
      window.setTimeout(() => setVisible(false), 80);
      return;
    }

    const { gsap } = await import("gsap");
    if (!overlayRef.current || !invitationRef.current || !ribbonRef.current) {
      setVisible(false);
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => setVisible(false),
    });
    animationRef.current = timeline;

    timeline
      .to([bowLeftRef.current, bowRightRef.current], { duration: 0.55, rotate: (index) => index ? 34 : -34, scaleX: 1.25, scaleY: 0.72 }, 0)
      .to(ribbonRef.current, { duration: 0.9, xPercent: 118 }, 0.12)
      .to(invitationRef.current, { duration: 0.75, rotateX: -3, scale: 1.025, y: -18 }, 0.3)
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.85 }, 0.72);
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

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (opening) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    const travel = Math.max(0, deltaX + Math.max(0, deltaY) * 0.38);
    const nextProgress = Math.min(1, travel / 150);
    dragRef.current.moved ||= Math.hypot(deltaX, deltaY) > 7;
    setDragProgress(nextProgress);

    if (nextProgress >= 0.72) {
      dragRef.current.active = false;
      void completeOpening(true);
    }
  }

  function handlePointerEnd(event: PointerEvent<HTMLButtonElement>) {
    if (dragRef.current.pointerId !== event.pointerId) return;
    const shouldOpen = dragProgress >= OPEN_THRESHOLD;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (shouldOpen) void completeOpening(true);
    else setDragProgress(0);
  }

  function handleRibbonClick() {
    if (!dragRef.current.moved) void completeOpening(true);
    dragRef.current.moved = false;
  }

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
          <div className={styles.invitation} ref={invitationRef}>
            <span aria-hidden="true" className={styles.backPaper} />
            <span aria-hidden="true" className={styles.envelopeFlap} />
            <div className={styles.cardFace}>
              <Monogram className={styles.monogram} src={monogramSrc} />
              <span aria-hidden="true" className={styles.goldDetail}>✦</span>
              <p>Maria &amp; Sérgio</p>
            </div>
            <button
              aria-label="Arraste a fita para abrir o convite ou pressione Enter"
              className={styles.ribbon}
              disabled={opening}
              onClick={handleRibbonClick}
              onPointerCancel={handlePointerEnd}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              ref={ribbonRef}
              style={{ "--drag-progress": dragProgress } as React.CSSProperties}
              type="button"
            >
              <span aria-hidden="true" className={styles.ribbonBand} />
              <span aria-hidden="true" className={styles.bowLeft} ref={bowLeftRef} />
              <span aria-hidden="true" className={styles.bowRight} ref={bowRightRef} />
              <span aria-hidden="true" className={styles.knot} />
              <span aria-hidden="true" className={styles.ribbonTail} />
              <span className="sr-only">Abrir convite</span>
            </button>
          </div>
          <div className={styles.instructions} aria-live="polite">
            <p><span className={styles.touchInstruction}>Deslize a fita para abrir</span><span className={styles.desktopInstruction}>Arraste ou clique para abrir</span></p>
            <span aria-hidden="true" className={styles.instructionLine}><i style={{ width: String(dragProgress * 100) + "%" }} /></span>
          </div>
          <button className={styles.alternativeButton} disabled={opening} onClick={() => void completeOpening(true)} type="button">
            Abrir convite
          </button>
        </div>
      </div>
    </>
  );
}
