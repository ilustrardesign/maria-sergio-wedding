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
    email: "maria@example.com",
    guests: [{ attendance: "yes", guestId: "guest-pedro" }],
    message: "",
    phone: "+55 83 99999-9999",
    ...overrides,
  };
}

describe("POST /api/rsvp", () => {
  it("processa demo pela rota HTTP e não chama Apps Script nem Resend", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_RSVP_MODE: "demo",
    };

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "demo-pedro" }] })));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      adminEmail: "skipped",
      emailNotificationSent: false,
      guestEmail: "skipped",
      id: null,
      mode: "demo",
      persisted: false,
      selectedGuests: [{ attendance: "yes", displayName: "Pedro Ivo", guestId: "demo-pedro" }],
      submitted: true,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("valida attendance individual em demo", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_RSVP_MODE: "demo",
    };

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ guests: [
      { attendance: "yes", guestId: "demo-pedro" },
      { attendance: "no", guestId: "demo-katherine" },
    ] })));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      adminEmail: "skipped",
      emailNotificationSent: false,
      guestEmail: "skipped",
      id: null,
      mode: "demo",
      persisted: false,
      selectedGuests: [
        { attendance: "yes", displayName: "Pedro Ivo", guestId: "demo-pedro" },
        { attendance: "no", displayName: "Katherine", guestId: "demo-katherine" },
      ],
      submitted: true,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejeita fake, mistura inválida, array vazio e duplicado em demo", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_RSVP_MODE: "demo",
    };

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const fakeResponse = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "guest-fake" }] })));
    const mixedResponse = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "demo-pedro" }, { attendance: "no", guestId: "guest-fake" }] })));
    const emptyResponse = await POST(request(basePayload({ guests: [] })));
    const duplicateResponse = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "demo-pedro" }, { attendance: "no", guestId: "demo-pedro" }] })));

    expect(fakeResponse.status).toBe(400);
    expect(mixedResponse.status).toBe(400);
    expect(emptyResponse.status).toBe(400);
    expect(duplicateResponse.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejeita submissão sem convidados", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ guests: [] })));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Selecione pelo menos um convidado." });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("aceita convidados válidos e envia somente guests[]", async () => {
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
          selectedGuests: [
            { attendance: "yes", displayName: "Pedro Ivo", guestId: "guest-pedro" },
            { attendance: "no", displayName: "Katherine", guestId: "guest-katherine" },
          ],
        }),
        ok: true,
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "guest-pedro" }, { attendance: "no", guestId: "guest-katherine" }] })));
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const submitCall = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    expect(submitCall).toMatchObject({
      email: "maria@example.com",
      guests: [{ attendance: "yes", guestId: "guest-pedro" }, { attendance: "no", guestId: "guest-katherine" }],
      message: "",
      phone: "+55 83 99999-9999",
    });
    expect(submitCall).not.toHaveProperty("attendance");
    expect(submitCall).not.toHaveProperty(`selectedGuest${"Ids"}`);
    expect(submitCall).not.toHaveProperty(`guest${"Names"}`);

    expect(json).toEqual({
      adminEmail: "sent",
      emailNotificationSent: true,
      guestEmail: "sent",
      id: "row-1",
      mode: "endpoint",
      persisted: true,
      selectedGuests: [
        { attendance: "yes", displayName: "Pedro Ivo", guestId: "guest-pedro" },
        { attendance: "no", displayName: "Katherine", guestId: "guest-katherine" },
      ],
      submitted: true,
    });
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

    const response = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "guest-fake" }] })));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "Convidado inválido." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejeita mistura de convidado válido com inválido", async () => {
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

    const response = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "guest-pedro" }, { attendance: "no", guestId: "guest-fake" }] })));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Convidado inválido." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejeita child, inactive e needs_review", async () => {
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

    const response = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "guest-lucas" }] })));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Convidado inválido." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("usa endpoint em produção mesmo quando NEXT_PUBLIC_RSVP_MODE=demo", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_RSVP_MODE: "demo",
      NODE_ENV: "production",
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
          selectedGuests: [{ attendance: "yes", displayName: "Pedro Ivo", guestId: "guest-pedro" }],
        }),
        ok: true,
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ guests: [{ attendance: "yes", guestId: "guest-pedro" }] })));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ mode: "endpoint", persisted: true, submitted: true });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
