import { describe, expect, it } from "vitest";

import { normalizeGuestRows, normalizeSearchText, searchGuestRows, validateSelectedGuestIds } from "./guests";

const rows = [
  { active: true, display_name: "Pedro Ivo", guest_id: "guest-pedro", needs_review: false, raw_name: "Pedro Ivo", rsvp_required: true, side: "Noivo" },
  { active: true, display_name: "Katherine", guest_id: "guest-katherine", needs_review: false, raw_name: "Katherine", rsvp_required: true, side: "Noiva" },
  { active: true, display_name: "Maria Teste", guest_id: "guest-maria", needs_review: false, raw_name: "Maria Teste", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Lucas", guest_id: "guest-lucas-1", is_baby: true, needs_review: false, raw_name: "Lucas*", rsvp_required: false, side: "Família" },
  { active: true, display_name: "Lucas", guest_id: "guest-lucas-2", is_child: true, needs_review: false, raw_name: "Lucas*", rsvp_required: false, side: "Família" },
  { active: false, display_name: "Inativo", guest_id: "guest-inactive", needs_review: false, raw_name: "Inativo", rsvp_required: true, side: "Amigos" },
  { active: true, display_name: "Revisão", guest_id: "guest-review", needs_review: true, raw_name: "Revisão", rsvp_required: true, side: "Amigos" },
];

describe("guest search helpers", () => {
  it("normaliza pesquisa com acento e caixa", () => {
    expect(normalizeSearchText(" Pédro ")).toBe("pedro");
  });

  it("não pesquisa com query curta", () => {
    expect(searchGuestRows(normalizeGuestRows(rows), "p")).toEqual([]);
  });

  it("busca de forma case-insensitive e accent-insensitive", () => {
    expect(searchGuestRows(normalizeGuestRows(rows), "péd")).toEqual([{ displayName: "Pedro Ivo", guestId: "guest-pedro" }]);
    expect(searchGuestRows(normalizeGuestRows(rows), "PED")).toEqual([{ displayName: "Pedro Ivo", guestId: "guest-pedro" }]);
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
    expect(searchGuestRows(normalizeGuestRows(rows), "ina")).toEqual([]);
    expect(searchGuestRows(normalizeGuestRows(rows), "rev")).toEqual([]);
  });

  it("valida IDs selecionados e rejeita qualquer inválido", () => {
    expect(validateSelectedGuestIds(normalizeGuestRows(rows), ["guest-pedro"])).toEqual({
      ok: true,
      selectedGuests: [{ displayName: "Pedro Ivo", guestId: "guest-pedro" }],
    });

    expect(validateSelectedGuestIds(normalizeGuestRows(rows), [])).toEqual({ ok: false });
    expect(validateSelectedGuestIds(normalizeGuestRows(rows), ["guest-pedro", "guest-pedro"])).toEqual({ ok: false });
    expect(validateSelectedGuestIds(normalizeGuestRows(rows), ["guest-fake"])).toEqual({ ok: false });
    expect(validateSelectedGuestIds(normalizeGuestRows(rows), ["guest-lucas-1"])).toEqual({ ok: false });
    expect(validateSelectedGuestIds(normalizeGuestRows(rows), ["guest-inactive"])).toEqual({ ok: false });
    expect(validateSelectedGuestIds(normalizeGuestRows(rows), ["guest-review"])).toEqual({ ok: false });
    expect(validateSelectedGuestIds(normalizeGuestRows(rows), ["guest-pedro", "guest-fake"])).toEqual({ ok: false });
  });
});
