import { afterEach, describe, expect, it, vi } from "vitest";

import { submitRsvp, type RsvpPayload } from "./rsvp";

const payload: RsvpPayload = {
  email: "maria@example.com",
  message: "",
  phone: "+55 83 99999-9999",
  guests: [{ attendance: "yes", guestId: "guest-1" }],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("submitRsvp", () => {
  it("usa /api/rsvp por padrão e aceita resposta demo", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        adminEmail: "skipped",
        emailNotificationSent: false,
        guestEmail: "skipped",
        id: null,
        mode: "demo",
        persisted: false,
        submitted: true,
      }),
    }));

    await expect(submitRsvp(payload)).resolves.toEqual({
      adminEmail: "skipped",
      emailNotificationSent: false,
      guestEmail: "skipped",
      id: null,
      mode: "demo",
      persisted: false,
      submitted: true,
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy.mock.calls[0][0]).toBe("/api/rsvp");
  });

  it("só confirma envio após resposta válida do endpoint", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ adminEmail: "sent", guestEmail: "skipped", id: "row-1" }) });
    vi.stubGlobal("fetch", fetchSpy);
    await expect(submitRsvp(payload, "https://example.test/rsvp")).resolves.toEqual({
      adminEmail: "sent",
      emailNotificationSent: false,
      guestEmail: "skipped",
      id: "row-1",
      mode: "endpoint",
      persisted: true,
      submitted: true,
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("propaga uma mensagem segura quando o endpoint falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(submitRsvp(payload, "https://example.test/rsvp")).rejects.toThrow(/Não foi possível/);
  });
});
