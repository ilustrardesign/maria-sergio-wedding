import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const originalEnv = process.env;

function request(body: unknown) {
  return new Request("http://localhost/api/pix/charges", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

describe("POST /api/pix/charges", () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("usa o preço do catálogo para presente fixo e ignora valor do client", async () => {
    process.env = { ...originalEnv, PIX_KEY_CPF: "12345678901", PIX_RECEIVER_NAME: "Maria Sergio", PIX_RECEIVER_CITY: "Recife" };
    const response = await POST(request({ amount: "1.00", giftId: "lava-seca" }));
    const json = await response.json();
    expect(response.ok).toBe(true);
    expect(json.amount).toBe("1278.09");
    expect(json.giftName).toContain("Lava e seca");
    expect(json).not.toHaveProperty("PIX_KEY_CPF");
    expect(json).not.toHaveProperty("pixKey");
  });

  it("aceita valor livre válido", async () => {
    process.env = { ...originalEnv, PIX_KEY_CPF: "12345678901", PIX_RECEIVER_NAME: "Maria Sergio", PIX_RECEIVER_CITY: "Recife" };
    const response = await POST(request({ amount: "150.00", giftId: "valor-livre" }));
    const json = await response.json();
    expect(response.ok).toBe(true);
    expect(json.amount).toBe("150.00");
    expect(json.pixCopyPaste).toMatch(/^000201/);
    expect(json.qrCode).toMatch(/^data:image\/png;base64,/);
  });

  it("recusa valor livre inválido", async () => {
    process.env = { ...originalEnv, PIX_KEY_CPF: "12345678901", PIX_RECEIVER_NAME: "Maria Sergio", PIX_RECEIVER_CITY: "Recife" };
    const response = await POST(request({ amount: "-10", giftId: "valor-livre" }));
    expect(response.status).toBe(400);
  });

  it("retorna erro claro quando Pix não está configurado", async () => {
    process.env = { ...originalEnv, PIX_KEY_CPF: "", PIX_RECEIVER_NAME: "", PIX_RECEIVER_CITY: "" };
    const response = await POST(request({ giftId: "buffet" }));
    const json = await response.json();
    expect(response.status).toBe(503);
    expect(json.message).toBe("Pix ainda não configurado.");
  });

  it("não retorna status paid", async () => {
    process.env = { ...originalEnv, PIX_KEY_CPF: "12345678901", PIX_RECEIVER_NAME: "Maria Sergio", PIX_RECEIVER_CITY: "Recife" };
    const response = await POST(request({ giftId: "buffet" }));
    const json = await response.json();
    expect(JSON.stringify(json)).not.toContain("paid");
  });
});
