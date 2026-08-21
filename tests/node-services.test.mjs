import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { createCalendarFile, createGoogleCalendarUrl } from "../src/lib/calendar.ts";
import { getCountdown } from "../src/lib/countdown.ts";
import { readGuestPersonalization } from "../src/lib/personalization.ts";
import { submitRsvp } from "../src/lib/rsvp.ts";

describe("contagem regressiva", () => {
  test("calcula unidades e estados de forma determinística", () => {
    const target = "2026-10-31T00:00:00-03:00";
    const now = new Date("2026-10-29T22:58:59-03:00").getTime();
    assert.deepEqual(getCountdown(target, now), { days: 1, hours: 1, minutes: 1, seconds: 1, status: "counting" });
    assert.equal(getCountdown(target, new Date("2026-10-31T10:00:00-03:00").getTime()).status, "today");
    assert.equal(getCountdown(target, new Date("2026-11-01T00:00:00-03:00").getTime()).status, "past");
  });

  test("recusa datas inválidas", () => assert.throws(() => getCountdown("inválida", 0), /inválida/));
});

describe("calendário", () => {
  const event = {
    startDate: "2026-10-31",
    endDate: "2026-11-01",
    title: "Casamento de Maria e Sérgio",
    description: "Celebração de Maria e Sérgio.",
    location: "Cabedelo, Paraíba",
  };

  test("gera ICS de dia inteiro", async () => {
    const text = await createCalendarFile(event).text();
    assert.match(text, /DTSTART;VALUE=DATE:20261031/);
    assert.match(text, /DTEND;VALUE=DATE:20261101/);
  });

  test("gera Google Calendar sem link inventado", () => {
    const url = new URL(createGoogleCalendarUrl(event));
    assert.equal(url.hostname, "calendar.google.com");
    assert.equal(url.searchParams.get("dates"), "20261031/20261101");
  });
});

describe("personalização futura", () => {
  test("aceita somente valores validados", () => {
    const valid = new URLSearchParams("convidado=Maria%20Silva&convite=abc-1234&acompanhantes=2");
    assert.deepEqual(readGuestPersonalization(valid), { guestName: "Maria Silva", invitationCode: "ABC-1234", maximumGuests: 2 });
    const invalid = new URLSearchParams("convidado=%3Cscript%3E&convite=%25%25%25&acompanhantes=99");
    assert.deepEqual(readGuestPersonalization(invalid), { guestName: undefined, invitationCode: undefined, maximumGuests: undefined });
  });
});

describe("serviço RSVP", () => {
  const payload = {
    attendance: "yes",
    email: "maria@example.com",
    firstName: "Maria",
    guestNames: "Maria Silva, João Silva",
    lastName: "Silva",
    message: "",
    phone: "+55 83 99999-9999",
  };
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });

  test("modo demo não envia nem finge persistência", async () => {
    let called = false;
    globalThis.fetch = async () => { called = true; return new Response(null, { status: 200 }); };
    assert.deepEqual(await submitRsvp(payload, ""), { mode: "demo", submitted: false });
    assert.equal(called, false);
  });

  test("endpoint só confirma após resposta real", async () => {
    globalThis.fetch = async () => new Response(null, { status: 204 });
    assert.deepEqual(await submitRsvp(payload, "https://example.test/rsvp"), { mode: "endpoint", submitted: true });
  });

  test("endpoint falho rejeita com mensagem segura", async () => {
    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(() => submitRsvp(payload, "https://example.test/rsvp"), /Não foi possível/);
  });
});
