import { describe, expect, it } from "vitest";

import { amountToCents, buildTxid, centsToPixAmount, createPixPayload, crc16, isPixConfigured, tlv } from "./pix";

const config = {
  key: "12345678901",
  receiverCity: "RECIFE",
  receiverName: "MARIA SERGIO",
};

describe("Pix BR Code", () => {
  it("monta TLV com comprimento correto", () => {
    expect(tlv("00", "BR.GOV.BCB.PIX")).toBe("0014BR.GOV.BCB.PIX");
  });

  it("normaliza valores em centavos sem aceitar strings arbitrárias", () => {
    expect(amountToCents("R$1.278,09")).toBe(127809);
    expect(amountToCents("150.00")).toBe(15000);
    expect(amountToCents("abc150")).toBeNull();
    expect(amountToCents("0")).toBeNull();
  });

  it("formata amount com duas casas", () => {
    expect(centsToPixAmount(127809)).toBe("1278.09");
  });

  it("gera txid compatível sem dados pessoais", () => {
    expect(buildTxid("lava-seca", "ABC123")).toBe("MSLAVASECAABC123");
    expect(buildTxid("á-é inválido", "***")).toBe("MSAEINVALIDO");
  });

  it("calcula CRC16 determinístico", () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  it("gera BR Code com chave, amount, txid e CRC", () => {
    const payload = createPixPayload(config, 17792, "MSBUFFETABC123");
    expect(payload).toContain("0014BR.GOV.BCB.PIX");
    expect(payload).toContain("011112345678901");
    expect(payload).toContain("5406177.92");
    expect(payload).toContain("0514MSBUFFETABC123");
    expect(payload).toMatch(/6304[A-F0-9]{4}$/);
  });

  it("rejeita configuração Pix incompleta", () => {
    expect(isPixConfigured({ key: "12345678901", receiverName: "Maria" })).toBe(false);
    expect(isPixConfigured(config)).toBe(true);
  });
});
