import { describe, expect, it } from "vitest";

import { readGuestPersonalization } from "./personalization";

describe("readGuestPersonalization", () => {
  it("aceita apenas parâmetros validados", () => {
    const params = new URLSearchParams("convidado=Maria%20Silva&acompanhantes=2");
    expect(readGuestPersonalization(params)).toEqual({ guestName: "Maria Silva", maximumGuests: 2 });
  });

  it("não expõe valores brutos inválidos", () => {
    const params = new URLSearchParams("convidado=%3Cscript%3E&acompanhantes=99");
    expect(readGuestPersonalization(params)).toEqual({ guestName: undefined, maximumGuests: undefined });
  });
});
