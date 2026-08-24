import { afterEach, describe, expect, it, vi } from "vitest";

import { submitRsvp, type RsvpPayload } from "./rsvp";

const payload: RsvpPayload = {
  attendance: "yes",
  email: "maria@example.com",
  guestId: "guest-1",
  inviteCode: "invite-1234567890",
  message: "",
  phone: "+55 83 99999-9999",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

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
