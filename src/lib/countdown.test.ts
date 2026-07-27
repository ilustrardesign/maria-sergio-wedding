import { describe, expect, it } from "vitest";

import { getCountdown } from "./countdown";

describe("getCountdown", () => {
  it("decompõe o tempo restante sem depender do relógio do teste", () => {
    const target = "2026-10-31T00:00:00-03:00";
    const now = new Date("2026-10-29T22:58:59-03:00").getTime();
    expect(getCountdown(target, now)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1, status: "counting" });
  });

  it("apresenta o estado do dia e o estado passado", () => {
    const target = "2026-10-31T00:00:00-03:00";
    expect(getCountdown(target, new Date("2026-10-31T10:00:00-03:00").getTime()).status).toBe("today");
    expect(getCountdown(target, new Date("2026-11-01T00:00:00-03:00").getTime()).status).toBe("past");
  });

  it("recusa uma data inválida", () => {
    expect(() => getCountdown("data-inválida", 0)).toThrow(/inválida/);
  });
});
