import { describe, expect, it } from "vitest";

import { readGuestPersonalization } from "./personalization";

describe("readGuestPersonalization", () => {
  it("aceita apenas parâmetros validados", () => {
    const params = new URLSearchParams("convidado=Maria%20Silva&convite=abc-1234&acompanhantes=2");
    expect(readGuestPersonalization(params)).toEqual({ guestName: "Maria Silva", invitationCode: "ABC-1234", maximumGuests: 2 });
  });

  it("não expõe valores brutos inválidos", () => {
    const params = new URLSearchParams("convidado=%3Cscript%3E&convite=%25%25%25&acompanhantes=99");
    expect(readGuestPersonalization(params)).toEqual({ guestName: undefined, invitationCode: undefined, maximumGuests: undefined });
  });
});
