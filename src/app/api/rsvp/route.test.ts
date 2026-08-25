import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const originalEnv = process.env;

afterEach(() => {
  process.env = originalEnv;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/rsvp", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

function basePayload(overrides: Record<string, unknown> = {}) {
  return {
    attendance: "yes",
    email: "maria@example.com",
    message: "",
    phone: "+55 83 99999-9999",
    selectedGuestIds: ["guest-pedro"],
    ...overrides,
  };
}

describe("POST /api/rsvp", () => {
  it("rejeita submissão sem convidados", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ selectedGuestIds: [] })));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Selecione pelo menos um convidado." });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("aceita convidados válidos e envia somente IDs", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          id: "row-1",
          ok: true,
          receivedAt: "2026-08-24T12:00:00.000Z",
          selectedGuests: [{ displayName: "Pedro Ivo", guestId: "guest-pedro" }],
        }),
        ok: true,
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload()));
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(json).toEqual({ id: "row-1", submitted: true });
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const submitCall = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    expect(submitCall).toMatchObject({
      attendance: "yes",
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      selectedGuestIds: ["guest-pedro"],
    });
    expect(submitCall).not.toHaveProperty(`guest${"Names"}`);
    expect(submitCall).not.toHaveProperty("displayName");
  });

  it("rejeita guest fake e não envia e-mails", async () => {
    process.env = {
      ...originalEnv,
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };

    const fetchSpy = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ ok: false, message: "Convidado inválido." }),
      ok: false,
    });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ selectedGuestIds: ["guest-fake"] })));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "Convidado inválido." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejeita mistura de ID válido com inválido", async () => {
    process.env = {
      ...originalEnv,
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };

    const fetchSpy = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ ok: false, message: "Convidado inválido." }),
      ok: false,
    });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ selectedGuestIds: ["guest-pedro", "guest-fake"] })));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Convidado inválido." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejeita IDs de criança, inativo e needs_review", async () => {
    process.env = {
      ...originalEnv,
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };

    const fetchSpy = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ ok: false, message: "Convidado inválido." }),
      ok: false,
    });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ selectedGuestIds: ["guest-lucas"] })));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Convidado inválido." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
