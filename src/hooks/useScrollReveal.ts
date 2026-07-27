"use client";

import { type RefObject, useEffect } from "react";

import { useReducedMotion } from "./useReducedMotion";

export function useScrollReveal(scope: RefObject<HTMLElement | null>, enabled: boolean) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion || !scope.current) return;

    let cancelled = false;
    let cleanup: () => void = () => undefined;

    async function setupAnimations() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !scope.current) return;

      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.fromTo(element, { autoAlpha: 0, y: 28 }, {
            autoAlpha: 1,
            duration: 1.05,
            ease: "power2.out",
            scrollTrigger: { start: "top 88%", trigger: element, once: true },
            y: 0,
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
          gsap.to(element, {
            ease: "none",
            scrollTrigger: { end: "bottom top", scrub: 0.8, start: "top bottom", trigger: element },
            yPercent: Number(element.dataset.parallax ?? 5),
          });
        });
      }, scope);

      cleanup = () => context.revert();
    }

    void setupAnimations();
    return () => { cancelled = true; cleanup(); };
  }, [enabled, reducedMotion, scope]);
}
