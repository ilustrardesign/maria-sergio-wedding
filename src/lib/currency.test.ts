import { describe, expect, it } from "vitest";

import { formatBrazilianCurrency, formatBrazilianCurrencyInput, normalizeBrazilianCurrency } from "./currency";

describe("Brazilian currency display", () => {
  it("formats fixed and Pix amounts with Brazilian grouping and symbol", () => {
    expect(formatBrazilianCurrency("R$86.036,15")).toBe("R$ 86.036,15");
    expect(formatBrazilianCurrency("177.92")).toBe("R$ 177,92");
  });
});

describe("Brazilian currency input", () => {
  it("turns natural digit entry into reais and centavos", () => {
    expect(formatBrazilianCurrencyInput("25000")).toBe("250,00");
    expect(formatBrazilianCurrencyInput("R$ 9,9")).toBe("0,99");
  });

  it("normalizes the formatted display value for the Pix API", () => {
    expect(normalizeBrazilianCurrency("1.234,56")).toBe("1234.56");
  });
});
