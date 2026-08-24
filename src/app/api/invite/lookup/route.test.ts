import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const originalEnv = process.env;

afterEach(() => {
  process.env = originalEnv;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function request(inviteCode: string) {
  return new Request("http://localhost/api/invite/lookup", {
    body: JSON.stringify({ inviteCode }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

describe("POST /api/invite/lookup", () => {
  it("rejeita código inválido sem consultar Apps Script", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request("bad"));
    const json = await response.json();

    expect(json).toEqual({ message: "Não encontramos este convite. Confira o código ou fale conosco.", valid: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("expõe apenas os dados públicos do convite", async () => {
    process.env = {
      ...originalEnv,
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };
    const fetchSpy = vi.fn().mockResolvedValue({
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
    });
    vi.stubGlobal("fetch", fetchSpy);

    const response = await POST(request("invite_1234567890"));
    const json = await response.json();

    expect(json).toEqual({
      dependents: [{ displayName: "Bebê Maria", guestId: "baby-1" }],
      displayName: "Maria Silva",
      guestId: "guest-1",
      rsvpRequired: true,
      valid: true,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejeita convites inativos", async () => {
    process.env = {
      ...originalEnv,
      RSVP_APPS_SCRIPT_URL: "https://script.example.test/exec",
      RSVP_SHARED_SECRET: "secret",
    };
    const fetchSpy = vi.fn().mockResolvedValue({
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

    const response = await POST(request("invite_1234567890"));
    const json = await response.json();

    expect(json).toEqual({ message: "Não encontramos este convite. Confira o código ou fale conosco.", valid: false });
  });
});
