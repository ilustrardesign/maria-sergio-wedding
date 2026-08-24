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
    guestId: "guest-1",
    inviteCode: "invite_1234567890",
    message: "",
    phone: "+55 83 99999-9999",
    ...overrides,
  };
}

describe("POST /api/rsvp", () => {
  it("rejeita código inválido sem consultar Apps Script", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ inviteCode: "bad" })));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "Não encontramos este convite. Confira o código ou fale conosco." });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejeita guestId diferente do registro canônico", async () => {
    process.env = {
      ...originalEnv,
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };
    const fetchSpy = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({
        active: true,
        displayName: "Maria Silva",
        guestId: "guest-1",
        needsReview: false,
        ok: true,
        rsvpRequired: true,
      }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ guestId: "guest-2" })));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "Não encontramos este convite. Confira o código ou fale conosco." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejeita convites inativos e não tenta persistir", async () => {
    process.env = {
      ...originalEnv,
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };
    const fetchSpy = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({
        active: false,
        displayName: "Maria Silva",
        guestId: "guest-1",
        needsReview: false,
        ok: true,
        rsvpRequired: true,
      }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload()));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "Não encontramos este convite. Confira o código ou fale conosco." });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("persiste antes de enviar e-mail e não expõe segredos", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          active: true,
          displayName: "Maria Silva",
          dependents: [{ displayName: "Bebê Maria", guestId: "baby-1" }],
          guestId: "guest-1",
          needsReview: false,
          ok: true,
          rsvpRequired: true,
          side: "Maria",
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ id: "row-1", ok: true }),
        ok: true,
      })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ email: "maria@example.com" })));
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(json).toEqual({ id: "row-1", submitted: true });
    expect(fetchSpy).toHaveBeenCalledTimes(4);
    const submitCall = JSON.parse(String(fetchSpy.mock.calls[1][1]?.body));
    expect(submitCall).not.toHaveProperty("displayName");
    expect(submitCall).not.toHaveProperty("guestNames");
    expect(String(consoleSpy.mock.calls[0]?.[1]?.inviteCodeRef ?? "")).not.toContain("invite_1234567890");
    consoleSpy.mockRestore();
  });

  it("continua submetendo mesmo quando o e-mail do convidado falha", async () => {
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
          active: true,
          displayName: "Maria Silva",
          dependents: [{ displayName: "Bebê Maria", guestId: "baby-1" }],
          guestId: "guest-1",
          needsReview: false,
          ok: true,
          rsvpRequired: true,
          side: "Maria",
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ id: "row-1", ok: true }),
        ok: true,
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(basePayload({ email: "maria@example.com" })));
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(json).toEqual({ id: "row-1", submitted: true });
    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });
});
