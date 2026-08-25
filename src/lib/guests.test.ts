import { describe, expect, it } from "vitest";

import { normalizeGuestRows, normalizeGuestSearchTerm, searchGuestRows, validateRsvpGuests } from "./guests";

const rows = [
  { active: true, display_name: "Pedro Ivo", guest_id: "guest-pedro", needs_review: false, raw_name: "Pedro Ivo", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Katherine", guest_id: "guest-katherine", needs_review: false, raw_name: "Katherine", rsvp_required: true, side: "Noiva" },
  { active: true, display_name: "João Evangelista", guest_id: "guest-joao", needs_review: false, raw_name: "João Evangelista", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Sérgio Teste", guest_id: "guest-sergio", needs_review: false, raw_name: "Sérgio Teste", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Catharina Teste", guest_id: "guest-catharina", needs_review: false, raw_name: "Catharina Teste", rsvp_required: true, side: "Noiva" },
  { active: true, display_name: "Maria Teste", guest_id: "guest-maria", needs_review: false, raw_name: "Maria Teste", rsvp_required: true, side: "Amigos" },
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
    expect(searchGuestRows(normalizeGuestRows(rows), "péd")).toEqual([{ displayName: "Pedro Ivo", guestId: "guest-pedro" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "PED")).toEqual([{ displayName: "Pedro Ivo", guestId: "guest-pedro" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "joao")).toEqual([{ displayName: "João Evangelista", guestId: "guest-joao" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "JOÃO")).toEqual([{ displayName: "João Evangelista", guestId: "guest-joao" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "sergio")).toEqual([{ displayName: "Sérgio Teste", guestId: "guest-sergio" }]);
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
    expect(searchGuestRows(normalizeGuestRows(rows), "Pedor")).toEqual([{ displayName: "Pedro Ivo", guestId: "guest-pedro" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Catarina")).toEqual([{ displayName: "Catharina Teste", guestId: "guest-catharina" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "Roberto")).toEqual([]);
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
