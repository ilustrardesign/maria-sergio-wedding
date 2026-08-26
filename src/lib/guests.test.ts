import { describe, expect, it } from "vitest";

import { normalizeGuestRows, normalizeGuestSearchTerm, searchGuestRows, validateRsvpGuests } from "./guests";

const rows = [
  { active: true, display_name: "Pedro Ivo", guest_id: "guest-pedro", needs_review: false, raw_name: "Pedro Ivo", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Pedro José", guest_id: "guest-pedro-jose", needs_review: false, raw_name: "Pedro José", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Pedro Rogério", guest_id: "guest-pedro-rogerio", needs_review: false, raw_name: "Pedro Rogério", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Steylon Pedro", guest_id: "guest-steylon-pedro", needs_review: false, raw_name: "Steylon Pedro", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Katherine", guest_id: "guest-katherine", needs_review: false, raw_name: "Katherine", rsvp_required: true, side: "Noiva" },
  { active: true, display_name: "João Evangelista", guest_id: "guest-joao", needs_review: false, raw_name: "João Evangelista", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "João Henrique", guest_id: "guest-joao-henrique", needs_review: false, raw_name: "João Henrique", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "João Oliveira", guest_id: "guest-joao-oliveira", needs_review: false, raw_name: "João Oliveira", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Sérgio Filho", guest_id: "guest-sergio-filho", needs_review: false, raw_name: "Sérgio Filho", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Sérgio Teste", guest_id: "guest-sergio", needs_review: false, raw_name: "Sérgio Teste", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Catharina Teste", guest_id: "guest-catharina", needs_review: false, raw_name: "Catharina Teste", rsvp_required: true, side: "Noiva" },
  { active: true, display_name: "Maria Teste", guest_id: "guest-maria", needs_review: false, raw_name: "Maria Teste", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Padre Renne Viana", guest_id: "guest-padre", needs_review: false, raw_name: "Padre Renne Viana", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Raquel Pessoa", guest_id: "guest-raquel", needs_review: false, raw_name: "Raquel Pessoa", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Augusto Medeiros", guest_id: "guest-augusto", needs_review: false, raw_name: "Augusto Medeiros", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Miguel Medeiros", guest_id: "guest-miguel", needs_review: false, raw_name: "Miguel Medeiros", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Lucas", guest_id: "guest-lucas-1", is_baby: true, needs_review: false, raw_name: "Lucas*", rsvp_required: false, side: "Família" },
  { active: true, display_name: "Lucas", guest_id: "guest-lucas-2", is_child: true, needs_review: false, raw_name: "Lucas*", rsvp_required: false, side: "Família" },
  { active: false, display_name: "Inativo", guest_id: "guest-inactive", needs_review: false, raw_name: "Inativo", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Revisão", guest_id: "guest-review", needs_review: true, raw_name: "Revisão", rsvp_required: true, side: "Amigos" },
];

describe("guest search helpers", () => {
  it("normaliza pesquisa com acento, caixa e espaços", () => {
    expect(normalizeGuestSearchTerm("  Pédro   Ivo ")).toBe("pedro ivo");
  });

  it("não pesquisa com query curta", () => {
    expect(searchGuestRows(normalizeGuestRows(rows), "p")).toEqual([]);
  });

  it("busca de forma case-insensitive e accent-insensitive", () => {
    expect(searchGuestRows(normalizeGuestRows(rows), "péd")).toEqual([
      { displayName: "Pedro Ivo", guestId: "guest-pedro" },
      { displayName: "Pedro José", guestId: "guest-pedro-jose" },
      { displayName: "Pedro Rogério", guestId: "guest-pedro-rogerio" },
      { displayName: "Steylon Pedro", guestId: "guest-steylon-pedro" },
    ]);
    expect(searchGuestRows(normalizeGuestRows(rows), "PED")).toEqual([
      { displayName: "Pedro Ivo", guestId: "guest-pedro" },
      { displayName: "Pedro José", guestId: "guest-pedro-jose" },
      { displayName: "Pedro Rogério", guestId: "guest-pedro-rogerio" },
      { displayName: "Steylon Pedro", guestId: "guest-steylon-pedro" },
    ]);
    expect(searchGuestRows(normalizeGuestRows(rows), "joao")).toEqual([
      { displayName: "João Evangelista", guestId: "guest-joao" },
      { displayName: "João Henrique", guestId: "guest-joao-henrique" },
      { displayName: "João Oliveira", guestId: "guest-joao-oliveira" },
    ]);
    expect(searchGuestRows(normalizeGuestRows(rows), "JOÃO")).toEqual([
      { displayName: "João Evangelista", guestId: "guest-joao" },
      { displayName: "João Henrique", guestId: "guest-joao-henrique" },
      { displayName: "João Oliveira", guestId: "guest-joao-oliveira" },
    ]);
    expect(searchGuestRows(normalizeGuestRows(rows), "sergio")).toEqual([
      { displayName: "Sérgio Filho", guestId: "guest-sergio-filho" },
      { displayName: "Sérgio Teste", guestId: "guest-sergio" },
    ]);
  });

  it("limita a oito resultados e nunca lista tudo em branco", () => {
    const manyRows = Array.from({ length: 12 }, (_, index) => ({
      active: true,
      display_name: `Pessoa ${index + 1}`,
      guest_id: `guest-${index + 1}`,
      needs_review: false,
      raw_name: `Pessoa ${index + 1}`,
      rsvp_required: true,
      side: "Lista",
    }));

    expect(searchGuestRows(normalizeGuestRows(manyRows), "pes")).toHaveLength(8);
    expect(searchGuestRows(normalizeGuestRows(manyRows), "")).toEqual([]);
  });

  it("exclui crianças, inativos e needs_review", () => {
    const results = searchGuestRows(normalizeGuestRows(rows), "lu");
    expect(results).toEqual([]);
    expect(searchGuestRows(normalizeGuestRows(rows), "inativo")).toEqual([]);
    expect(searchGuestRows(normalizeGuestRows(rows), "rev")).toEqual([]);
  });

  it("aceita typo leve mas não sugestão distante", () => {
    expect(searchGuestRows(normalizeGuestRows(rows), "Pedor")).toEqual([
      { displayName: "Pedro Ivo", guestId: "guest-pedro" },
      { displayName: "Pedro José", guestId: "guest-pedro-jose" },
      { displayName: "Pedro Rogério", guestId: "guest-pedro-rogerio" },
      { displayName: "Steylon Pedro", guestId: "guest-steylon-pedro" },
    ]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Catarina")).toEqual([{ displayName: "Catharina Teste", guestId: "guest-catharina" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Pedro")).toEqual([
      { displayName: "Pedro Ivo", guestId: "guest-pedro" },
      { displayName: "Pedro José", guestId: "guest-pedro-jose" },
      { displayName: "Pedro Rogério", guestId: "guest-pedro-rogerio" },
      { displayName: "Steylon Pedro", guestId: "guest-steylon-pedro" },
    ]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Roberto")).toEqual([]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Cristiano Ronaldo")).toEqual([]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Jemima")).toEqual([]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Sérgio Filho")).toEqual([{ displayName: "Sérgio Filho", guestId: "guest-sergio-filho" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Pedro")).not.toEqual(
      expect.arrayContaining([
        { displayName: "Padre Renne Viana", guestId: "guest-padre" },
        { displayName: "Raquel Pessoa", guestId: "guest-raquel" },
        { displayName: "Augusto Medeiros", guestId: "guest-augusto" },
        { displayName: "Miguel Medeiros", guestId: "guest-miguel" },
      ]),
    );
  });

  it("valida convidados com attendance e rejeita qualquer inválido", () => {
    expect(validateRsvpGuests(normalizeGuestRows(rows), [{ attendance: "yes", guestId: "guest-pedro" }])).toEqual({
      ok: true,
      selectedGuests: [{ attendance: "yes", displayName: "Pedro Ivo", guestId: "guest-pedro" }],
    });

    expect(validateRsvpGuests(normalizeGuestRows(rows), [])).toEqual({ ok: false });
    expect(validateRsvpGuests(normalizeGuestRows(rows), [{ attendance: "yes", guestId: "guest-pedro" }, { attendance: "no", guestId: "guest-pedro" }])).toEqual({ ok: false });
    expect(validateRsvpGuests(normalizeGuestRows(rows), [{ attendance: "yes", guestId: "guest-fake" }])).toEqual({ ok: false });
    expect(validateRsvpGuests(normalizeGuestRows(rows), [{ attendance: "yes", guestId: "guest-lucas-1" }])).toEqual({ ok: false });
    expect(validateRsvpGuests(normalizeGuestRows(rows), [{ attendance: "yes", guestId: "guest-inactive" }])).toEqual({ ok: false });
    expect(validateRsvpGuests(normalizeGuestRows(rows), [{ attendance: "yes", guestId: "guest-review" }])).toEqual({ ok: false });
    expect(validateRsvpGuests(normalizeGuestRows(rows), [{ attendance: "yes", guestId: "guest-pedro" }, { attendance: "no", guestId: "guest-fake" }])).toEqual({ ok: false });
  });
});
