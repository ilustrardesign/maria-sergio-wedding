"use client";

import { useCallback, useRef, useState } from "react";

import { AudioController, type AudioControllerHandle } from "@/components/AudioController";
import { Navigation } from "@/components/Navigation";
import { InvitationOpening } from "@/components/opening/InvitationOpening";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { DressCodeSection } from "@/components/sections/DressCodeSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { GiftsSection } from "@/components/sections/GiftsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import { ScheduleSection } from "@/components/sections/ScheduleSection";
import { StorySection } from "@/components/sections/StorySection";
import { TravelSection } from "@/components/sections/TravelSection";
import { VenuesSection } from "@/components/sections/VenuesSection";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { WeddingContent } from "@/types/wedding";

type WeddingExperienceProps = { content: WeddingContent };

export function WeddingExperience({ content }: WeddingExperienceProps) {
  const mainRef = useRef<HTMLElement>(null);
  const audioRef = useRef<AudioControllerHandle>(null);
  const [opened, setOpened] = useState(false);

  const handleOpen = useCallback((fromGesture: boolean) => {
    if (fromGesture && content.audio.enabled) audioRef.current?.playFromGesture();
    setOpened(true);
  }, [content.audio.enabled]);

  useScrollReveal(mainRef, opened);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <InvitationOpening monogramSrc={content.assets.monogram.src} onOpen={handleOpen} />
      <Navigation content={content} />
      {content.features.showAudioControl ? (
        <AudioController enabled={content.audio.enabled} ref={audioRef} src={content.audio.src} />
      ) : null}
      <main id="conteudo" ref={mainRef}>
        <HeroSection content={content} />
        <CountdownSection content={content} />
        {content.features.showStory ? <StorySection story={content.story} /> : null}
        <VenuesSection venues={content.venues} />
        {content.features.showSchedule ? <ScheduleSection schedule={content.schedule} /> : null}
        {content.features.showDressCode ? <DressCodeSection dressCode={content.dressCode} /> : null}
        {content.features.showGallery ? <GallerySection gallery={content.gallery} /> : null}
        {content.features.showRsvp ? <RsvpSection content={content} /> : null}
        {content.features.showGifts ? <GiftsSection gifts={content.gifts} /> : null}
        {content.features.showTravel ? <TravelSection travel={content.travel} /> : null}
        <ClosingSection content={content} />
      </main>
    </div>
  );
}
