import { afterEach, describe, expect, it, vi } from "vitest";

import { isValidPayload, POST } from "../app/api/rsvp/route";
import { submitRsvp, type RsvpPayload } from "./rsvp";

const payload: RsvpPayload = {
  attendance: "yes",
  email: "maria@example.com",
  firstName: "Maria",
  guestNames: "Maria Silva, João Silva",
  lastName: "Silva",
  message: "",
  phone: "+55 83 99999-9999",
};

const originalEnv = process.env;

afterEach(() => {
  process.env = originalEnv;
  vi.unstubAllGlobals();
});

function request(body: unknown) {
  return new Request("http://localhost/api/rsvp", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

describe("submitRsvp", () => {
  it("não faz requisição nem alega persistência sem endpoint", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(submitRsvp(payload, "")).resolves.toEqual({ mode: "demo", submitted: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("só confirma envio após resposta válida do endpoint", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);
    await expect(submitRsvp(payload, "https://example.test/rsvp")).resolves.toEqual({ mode: "endpoint", submitted: true });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("propaga uma mensagem segura quando o endpoint falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(submitRsvp(payload, "https://example.test/rsvp")).rejects.toThrow(/Não foi possível/);
  });
});

describe("isValidPayload", () => {
  it("permite RSVP negativo sem nomes dos convidados", () => {
    expect(isValidPayload({ ...payload, attendance: "no", guestNames: "" })).toBe(true);
  });

  it("exige nomes dos convidados quando a presença é confirmada", () => {
    expect(isValidPayload({ ...payload, attendance: "yes", guestNames: "" })).toBe(false);
  });
});

describe("POST /api/rsvp", () => {
  it("mantém RSVP salva quando Resend falha depois da persistência no Apps Script", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
      RESEND_FROM_EMAIL: "Maria & Sérgio <rsvp@mariaesergio.com>",
      RESEND_REPLY_TO_EMAIL: "rsvp@mariaesergio.com",
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ id: "row-1", ok: true }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ message: "Resend unavailable" }),
        ok: false,
      });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request(payload));
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(json).toMatchObject({ id: "row-1", submitted: true, emailNotificationSent: false });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
