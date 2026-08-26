import { createRef } from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AudioController, __resetSpotifyIframeApiForTests, type AudioControllerHandle } from "./AudioController";

type PlaybackListener = (event: {
  data: { duration: number; isBuffering: boolean; isPaused: boolean; position: number };
}) => void;

describe("AudioController Spotify iFrame API", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.onSpotifyIframeApiReady = undefined;
    __resetSpotifyIframeApiForTests();
  });

  it("solicita play pelo gesto do convite e reinicia a faixa ao fim", async () => {
    const ref = createRef<AudioControllerHandle>();
    let playbackListener: PlaybackListener | undefined;
    const controller = {
      addListener: vi.fn((event: string, listener: PlaybackListener) => {
        if (event === "playback_update") playbackListener = listener;
      }),
      pause: vi.fn(),
      play: vi.fn(),
      restart: vi.fn(),
      resume: vi.fn(),
      togglePlay: vi.fn(),
    };
    const api = { createController: vi.fn((_element, _options, callback) => callback(controller)) };

    render(<AudioController enabled ref={ref} spotifyUri="spotify:track:6c6brFif6MTMSq0sVwgMAT" spotifyUrl="" title="Beija Flor" />);
    window.onSpotifyIframeApiReady?.(api);
    await waitFor(() => expect(api.createController).toHaveBeenCalled());

    ref.current?.playFromGesture();

    expect(controller.play).toHaveBeenCalledTimes(1);
    ref.current?.pause();
    ref.current?.resume();
    expect(controller.pause).toHaveBeenCalledTimes(1);
    expect(controller.resume).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    playbackListener?.({ data: { duration: 180000, isBuffering: false, isPaused: false, position: 179800 } });

    expect(controller.restart).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(220);
    expect(controller.resume).toHaveBeenCalledTimes(2);
    ref.current?.togglePlay();
    expect(controller.togglePlay).toHaveBeenCalledTimes(1);
  });

  it("mantém preview curto em loop e preserva pausa/resume manual", async () => {
    const ref = createRef<AudioControllerHandle>();
    let playbackListener: PlaybackListener | undefined;
    const controller = {
      addListener: vi.fn((event: string, listener: PlaybackListener) => {
        if (event === "playback_update") playbackListener = listener;
      }),
      pause: vi.fn(),
      play: vi.fn(),
      restart: vi.fn(),
      resume: vi.fn(),
      togglePlay: vi.fn(),
    };
    const api = { createController: vi.fn((_element, _options, callback) => callback(controller)) };

    render(<AudioController enabled ref={ref} spotifyUri="spotify:track:6c6brFif6MTMSq0sVwgMAT" spotifyUrl="" title="Beija Flor" />);
    window.onSpotifyIframeApiReady?.(api);
    await waitFor(() => expect(api.createController).toHaveBeenCalled());

    ref.current?.playFromGesture();
    expect(controller.play).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    playbackListener?.({ data: { duration: 45000, isBuffering: false, isPaused: false, position: 44880 } });
    vi.advanceTimersByTime(1);
    expect(controller.restart).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(220);
    expect(controller.resume).toHaveBeenCalledTimes(1);

    ref.current?.pause();
    ref.current?.resume();
    ref.current?.togglePlay();
    expect(controller.pause).toHaveBeenCalledTimes(1);
    expect(controller.resume).toHaveBeenCalledTimes(2);
    expect(controller.togglePlay).toHaveBeenCalledTimes(1);
  });
});
