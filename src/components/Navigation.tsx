"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import type { WeddingContent } from "@/types/wedding";

import styles from "./Navigation.module.css";

type NavigationProps = { content: WeddingContent };

export function Navigation({ content }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#inicio");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let frame = 0;

    const updateScrollState = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const root = document.documentElement;
        const scrollable = Math.max(0, root.scrollHeight - window.innerHeight);
        const nextProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
        setProgress(Math.min(1, Math.max(0, nextProgress)));
        setScrolled(window.scrollY > 18);
      });
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const observedSections = content.navigation
      .map((item) => item.href.startsWith("#") ? document.getElementById(item.href.slice(1)) : null)
      .filter((section): section is HTMLElement => section !== null);

    if (!observedSections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        const current = visible[0]?.target;
        if (current?.id) setActiveHref("#" + current.id);
      },
      { rootMargin: "-18% 0px -72% 0px", threshold: 0 },
    );

    observedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [content.navigation]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => firstMobileLinkRef.current?.focus());
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !menuPanelRef.current) return;
      const focusable = Array.from(
        menuPanelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const wideViewport = window.matchMedia("(min-width: 72rem)");
    const closeOnWideViewport = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    wideViewport.addEventListener("change", closeOnWideViewport);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      wideViewport.removeEventListener("change", closeOnWideViewport);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function scrollToTop() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  const showBackToTop = progress > 0.08;

  return (
    <>
      <header className={[styles.navigation, scrolled || menuOpen ? styles.navigationVisible : ""].filter(Boolean).join(" ")}>
        <div aria-hidden="true" className={[styles.progressTrack, scrolled ? styles.progressTrackVisible : ""].filter(Boolean).join(" ")}>
          <span style={{ transform: "scaleX(" + progress + ")" }} />
        </div>

        <div className={styles.bar}>
          <nav aria-label="Navegação principal" className={styles.desktopNav}>
            <ul>
              {content.navigation.map((item) => (
                <li key={item.href}>
                  <a aria-current={activeHref === item.href ? "location" : undefined} href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            aria-controls="mobile-navigation-panel"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className={styles.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            ref={menuButtonRef}
            type="button"
          >
            <span aria-hidden="true">{menuOpen ? "Fechar" : "Menu"}</span>
            <Icon name={menuOpen ? "close" : "menu"} size={21} />
          </button>
        </div>

        {menuOpen ? (
          <div className={styles.mobilePanel} id="mobile-navigation-panel" ref={menuPanelRef}>
            <span aria-hidden="true" className={styles.mobileWash} />
            <nav aria-label="Navegação principal — menu móvel">
              <p aria-hidden="true" className={styles.mobileKicker}>{content.couple.displayName}</p>
              <ul>
                {content.navigation.map((item, index) => (
                  <li key={item.href}>
                    <a
                      aria-current={activeHref === item.href ? "location" : undefined}
                      href={item.href}
                      onClick={closeMenu}
                      ref={index === 0 ? firstMobileLinkRef : undefined}
                    >
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      {item.label}
                    </a>
                  </li>
                ))}
                {content.features.showAudioControl && content.audio.enabled ? (
                  <li>
                    <button className={styles.mobilePlayerButton} onClick={() => { closeMenu(); window.dispatchEvent(new Event("open-spotify-player")); }} type="button">
                      <span aria-hidden="true">♪</span>
                      Player da música
                    </button>
                  </li>
                ) : null}
              </ul>
            </nav>
          </div>
        ) : null}
      </header>

      <button
        aria-hidden={!showBackToTop}
        aria-label={content.closing.backToTopLabel}
        className={[styles.backToTop, showBackToTop ? styles.backToTopVisible : ""].filter(Boolean).join(" ")}
        onClick={scrollToTop}
        tabIndex={showBackToTop ? 0 : -1}
        title={content.closing.backToTopLabel}
        type="button"
      >
        <Icon name="top" size={19} />
      </button>
    </>
  );
}
