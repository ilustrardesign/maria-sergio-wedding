import { afterEach, describe, expect, it, vi } from "vitest";

import { renderRsvpAdminEmail } from "@/emails/RsvpAdminEmail";
import { renderRsvpGuestEmail } from "@/emails/RsvpGuestEmail";
import { sendRsvpEmails } from "./resend";

describe("Resend templates", () => {
  it("usa a URL de produção no HTML e no texto do convidado", () => {
    const email = renderRsvpGuestEmail({ attendance: "yes", firstName: "Maria" });
    expect(email.html).toContain("https://mariaesergio.com");
    expect(email.text).toContain("https://mariaesergio.com");
    expect(email.html).toContain("style=");
    expect(email.html).not.toContain("<style");
  });

  it("mantém a copy de presença e ausência", () => {
    expect(renderRsvpGuestEmail({ attendance: "yes", firstName: "Maria" }).subject).toBe("Que alegria ter você conosco — Maria & Sérgio");
    expect(renderRsvpGuestEmail({ attendance: "no", firstName: "Maria" }).subject).toBe("Recebemos sua resposta — Maria & Sérgio");
  });

  it("monta o e-mail administrativo com dados canônicos", () => {
    const email = renderRsvpAdminEmail({
      attendance: "yes",
      dependents: [{ displayName: "Bebê Maria", guestId: "baby-1" }],
      displayName: "Maria Silva",
      email: "maria@example.com",
      guestId: "guest-1",
      inviteCodeRef: "abc123",
      message: "Até lá",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      side: "Maria",
    });

    expect(email.subject).toBe("RSVP · Maria Silva · Presença confirmada");
    expect(email.html).toContain("guest-1");
    expect(email.html).toContain("Bebê Maria");
    expect(email.html).toContain("https://mariaesergio.com");
    expect(email.html).not.toContain("invite_code");
  });
});

describe("sendRsvpEmails", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fica em silêncio quando Resend está desativado", async () => {
    process.env = { ...originalEnv, RESEND_ENABLED: "false" };
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      attendance: "yes",
      displayName: "Maria Silva",
      email: "maria@example.com",
      guestId: "guest-1",
      inviteCodeRef: "abc123",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
    })).resolves.toEqual({ admin: "skipped", attempted: false, guest: "skipped", sent: false });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("envia admin e convidado de forma independente", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      attendance: "yes",
      displayName: "Maria Silva",
      email: "maria@example.com",
      guestId: "guest-1",
      inviteCodeRef: "abc123",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
    })).resolves.toEqual({ admin: "sent", attempted: true, guest: "sent", sent: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("ignora o e-mail do convidado quando ele não informa endereço", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    await sendRsvpEmails({
      attendance: "no",
      displayName: "Maria Silva",
      email: "",
      guestId: "guest-1",
      inviteCodeRef: "abc123",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
