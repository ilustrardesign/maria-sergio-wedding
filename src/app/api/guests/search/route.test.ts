import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const originalEnv = process.env;

afterEach(() => {
  process.env = originalEnv;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function request(query: string) {
  return new Request("http://localhost/api/guests/search", {
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

describe("POST /api/guests/search", () => {
  it("usa exclusivamente o demo local quando NEXT_PUBLIC_RSVP_MODE=demo", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_RSVP_MODE: "demo",
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const pedResponse = await POST(request("ped"));
    const pedJson = await pedResponse.json();
    expect(pedResponse.status).toBe(200);
    expect(pedJson).toEqual({ guests: [{ displayName: "Pedro Ivo", guestId: "demo-pedro" }] });
    expect(fetchSpy).not.toHaveBeenCalled();

    const katResponse = await POST(request("kat"));
    const katJson = await katResponse.json();
    expect(katResponse.status).toBe(200);
    expect(katJson).toEqual({ guests: [{ displayName: "Katherine", guestId: "demo-katherine" }] });
    expect(fetchSpy).not.toHaveBeenCalled();

    const emptyResponse = await POST(request("Cristiano Ronaldo"));
    const emptyJson = await emptyResponse.json();
    expect(emptyResponse.status).toBe(200);
    expect(emptyJson).toEqual({ guests: [] });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("no modo endpoint usa o backend remoto", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_RSVP_MODE: "endpoint",
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };

    const fetchSpy = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({
        ok: true,
        guests: [{ displayName: "Pedro Ivo", guestId: "guest-pedro" }],
      }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request("ped"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ guests: [{ displayName: "Pedro Ivo", guestId: "guest-pedro" }] });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("não usa mock demo em produção quando endpoint está ativo", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_RSVP_MODE: "endpoint",
      NODE_ENV: "production",
    };

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request("ped"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ guests: [] });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
