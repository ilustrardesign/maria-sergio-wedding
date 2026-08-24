import { describe, expect, it } from "vitest";

import {
  buildInviteLookupResponse,
  canAttachDependentToGuardian,
  canSubmitInvite,
  createInviteUrl,
  createPublicInviteFailure,
  deriveDependentAttendance,
  filterDependentsForGuardian,
  normalizeGuestRegistryRows,
  normalizeInviteCode,
} from "./invite";

const adultRecord = {
  active: true,
  displayName: "Raquel Pessoa",
  dependents: [],
  guestId: "adult-1",
  needsReview: false,
  rsvpRequired: true,
};

const dependentRecord = {
  active: true,
  displayName: "Bebê Raquel",
  dependents: [],
  guestId: "baby-1",
  guardianGuestId: "adult-1",
  isBaby: true,
  needsReview: false,
  rsvpRequired: false,
};

describe("invite helpers", () => {
  it("normaliza espaço sem alterar o código", () => {
    expect(normalizeInviteCode("  abc-123  \n")).toBe("abc-123");
  });

  it("gera resposta pública genérica", () => {
    expect(createPublicInviteFailure()).toEqual({ message: "Não encontramos este convite. Confira o código ou fale conosco.", valid: false });
  });

  it("rejeita convite inativo", () => {
    expect(canSubmitInvite(
      { active: false, dependents: [], displayName: "Maria", guestId: "g1", needsReview: false, rsvpRequired: true },
      "g1",
      "invite_1234567890",
    )).toEqual({ ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." });
  });

  it("rejeita bebê sem RSVP", () => {
    expect(canSubmitInvite(
      { active: true, dependents: [], displayName: "Bebê", guestId: "g1", needsReview: false, rsvpRequired: false },
      "g1",
      "invite_1234567890",
    )).toEqual({ ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." });
  });

  it("rejeita guestId diferente do convite", () => {
    expect(canSubmitInvite(
      { active: true, dependents: [], displayName: "Maria", guestId: "g1", needsReview: false, rsvpRequired: true },
      "g2",
      "invite_1234567890",
    )).toEqual({ ok: false, message: "Não encontramos este convite. Confira o código ou fale conosco." });
  });

  it("aceita convite ativo com guestId correspondente", () => {
    expect(canSubmitInvite(
      { active: true, dependents: [], displayName: "Maria", guestId: "g1", needsReview: false, rsvpRequired: true },
      "g1",
      "invite_1234567890",
    )).toEqual({ ok: true });
  });

  it("gera URL privada usando apenas o código do convite", () => {
    expect(createInviteUrl("invite_1234567890")).toBe("https://mariaesergio.com/?convite=invite_1234567890");
  });

  it("marca bebê sem responsável para revisão e sem código", () => {
    const [row] = normalizeGuestRegistryRows([
      {
        active: true,
        created_at: "",
        display_name: "",
        guardian_guest_id: "",
        guest_id: "",
        invite_code: "invite_1234567890",
        invite_url: "",
        is_baby: false,
        needs_review: false,
        notes: "",
        raw_name: "Bebê Raquel*",
        rsvp_required: true,
        side: "Maria",
      },
    ]);

    expect(row.is_baby).toBe(true);
    expect(row.rsvp_required).toBe(false);
    expect(row.invite_code).toBe("");
    expect(row.invite_url).toBe("");
    expect(row.needs_review).toBe(true);
  });

  it("mantém o bebê fora de revisão quando há responsável válido", () => {
    const [adult, baby] = normalizeGuestRegistryRows([
      {
        active: true,
        created_at: "",
        display_name: "",
        guardian_guest_id: "",
        guest_id: "adult-1",
        invite_code: "invite_1234567890",
        invite_url: "",
        is_baby: false,
        needs_review: false,
        notes: "",
        raw_name: "Raquel Pessoa",
        rsvp_required: true,
        side: "Maria",
      },
      {
        active: true,
        created_at: "",
        display_name: "",
        guardian_guest_id: "adult-1",
        guest_id: "baby-1",
        invite_code: "",
        invite_url: "",
        is_baby: false,
        needs_review: false,
        notes: "",
        raw_name: "Bebê Raquel*",
        rsvp_required: true,
        side: "Maria",
      },
    ]);

    expect(adult.invite_url).toBe("https://mariaesergio.com/?convite=invite_1234567890");
    expect(baby.is_baby).toBe(true);
    expect(baby.needs_review).toBe(false);
    expect(baby.guardian_guest_id).toBe("adult-1");
  });

  it("retorna somente os dependentes do guardião canônico", () => {
    const dependents = filterDependentsForGuardian([
      {
        active: true,
        dependents: [],
        displayName: "Raquel Pessoa",
        guestId: "adult-1",
        needsReview: false,
        rsvpRequired: true,
      },
      {
        active: true,
        dependents: [],
        displayName: "Bebê Raquel",
        guestId: "baby-1",
        guardianGuestId: "adult-1",
        isBaby: true,
        needsReview: false,
        rsvpRequired: false,
      },
      {
        active: true,
        dependents: [],
        displayName: "Outro Bebê",
        guestId: "baby-2",
        guardianGuestId: "adult-2",
        isBaby: true,
        needsReview: false,
        rsvpRequired: false,
      },
    ], "adult-1");

    expect(dependents).toEqual([{ displayName: "Bebê Raquel", guestId: "baby-1" }]);
  });

  it("não retorna o guardião dentro da lista de dependentes", () => {
    expect(buildInviteLookupResponse(adultRecord, [{ displayName: "Raquel Pessoa", guestId: "adult-1" }, { displayName: "Bebê Raquel", guestId: "baby-1" }])).toEqual({
      dependents: [{ displayName: "Bebê Raquel", guestId: "baby-1" }],
      displayName: "Raquel Pessoa",
      guestId: "adult-1",
      rsvpRequired: true,
      valid: true,
    });
  });

  it("faz a presença dos dependentes seguir a do guardião", () => {
    expect(deriveDependentAttendance("yes", [{ displayName: "Bebê Raquel", guestId: "baby-1" }])).toEqual([{ attendance: "yes", displayName: "Bebê Raquel", guestId: "baby-1" }]);
    expect(deriveDependentAttendance("no", [{ displayName: "Bebê Raquel", guestId: "baby-1" }])).toEqual([{ attendance: "no", displayName: "Bebê Raquel", guestId: "baby-1" }]);
  });

  it("rejeita tentativa de anexar dependente a outro guardião", () => {
    expect(canAttachDependentToGuardian(dependentRecord, "adult-2")).toBe(false);
    expect(canAttachDependentToGuardian(dependentRecord, "adult-1")).toBe(true);
  });
});
