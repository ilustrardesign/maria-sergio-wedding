import { afterEach, describe, expect, it, vi } from "vitest";

import { renderRsvpAdminEmail } from "@/emails/RsvpAdminEmail";
import { renderRsvpGuestEmail } from "@/emails/RsvpGuestEmail";
import { sendRsvpEmails } from "./resend";

describe("Resend templates", () => {
  it("usa a URL de produção no HTML e no texto do convidado", () => {
    const email = renderRsvpGuestEmail({ selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }] });
    expect(email.html).toContain("https://mariaesergio.com");
    expect(email.text).toContain("https://mariaesergio.com");
    expect(email.html).toContain("style=");
    expect(email.html).not.toContain("<style");
  });

  it("cobre copy de yes, mixed e no no convidado", () => {
    expect(renderRsvpGuestEmail({ selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }] }).html).toContain("PRESENÇA CONFIRMADA");
    expect(renderRsvpGuestEmail({ selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }] }).subject).toBe("Que alegria ter você conosco");
    expect(renderRsvpGuestEmail({ selectedGuests: [{ attendance: "no", displayName: "Maria Silva", guestId: "guest-1" }] }).subject).toBe("Recebemos sua resposta");
    expect(renderRsvpGuestEmail({
      selectedGuests: [
        { attendance: "yes", displayName: "Pedro Ivo", guestId: "guest-1" },
        { attendance: "no", displayName: "Katherine", guestId: "guest-2" },
      ],
    }).subject).toBe("Recebemos sua confirmação");
  });

  it("monta o e-mail administrativo com convidados canônicos", () => {
    const email = renderRsvpAdminEmail({
      email: "maria@example.com",
      message: "Até lá",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }, { attendance: "no", displayName: "Pedro Ivo", guestId: "guest-2" }],
    });

    expect(email.subject).toBe("RSVP · Maria Silva + Pedro Ivo");
    expect(email.html).toContain("Maria Silva");
    expect(email.html).toContain("Pedro Ivo");
    expect(email.html).toContain("https://mariaesergio.com");
    expect(email.html).not.toContain(`invite_${"code"}`);
    expect(email.text).toContain("NOVA CONFIRMAÇÃO DE PRESENÇA");
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
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "skipped", attempted: false, guest: "skipped", sent: false });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fica em silêncio quando a chave do Resend está ausente", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_ENABLED: "true",
    };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "skipped", attempted: false, guest: "skipped", sent: false });

    expect(warnSpy).toHaveBeenCalledTimes(1);
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
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "sent", attempted: true, guest: "sent", sent: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("retorna admin skipped e guest skipped sem disparar envio quando não há destinatários", async () => {
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      email: "",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "no", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "skipped", attempted: false, guest: "skipped", sent: false });

    expect(fetchSpy).not.toHaveBeenCalled();
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
      email: "",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "no", displayName: "Maria Silva", guestId: "guest-1" }],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("mantém admin e guest independentes quando um deles falha", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "failed", attempted: true, guest: "sent", sent: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("mantém admin e guest independentes quando o guest falha", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "sent", attempted: true, guest: "failed", sent: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("não impede o outro envio quando admin falha e guest responde", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "failed", attempted: true, guest: "sent", sent: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("não impede o outro envio quando guest falha e admin responde", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      email: "maria@example.com",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "yes", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "sent", attempted: true, guest: "failed", sent: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("não tenta convidado quando não há e-mail e não deixa erro do guest voltar", async () => {
    process.env = {
      ...originalEnv,
      RESEND_ADMIN_EMAILS: "admin@example.com",
      RESEND_API_KEY: "test-key",
      RESEND_ENABLED: "true",
    };
    const fetchSpy = vi.fn().mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendRsvpEmails({
      email: "",
      message: "",
      phone: "+55 83 99999-9999",
      receivedAt: "2026-08-24T12:00:00.000Z",
      selectedGuests: [{ attendance: "no", displayName: "Maria Silva", guestId: "guest-1" }],
    })).resolves.toEqual({ admin: "sent", attempted: true, guest: "skipped", sent: true });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("marca all no com subject e HTML corretos no preview", () => {
    const email = renderRsvpGuestEmail({ selectedGuests: [{ attendance: "no", displayName: "Maria Silva", guestId: "guest-1" }] });
    expect(email.html).toContain("Recebemos sua resposta");
    expect(email.text).toContain("Sentiremos sua falta");
  });
});
