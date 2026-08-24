import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { GiftsConfig } from "@/types/wedding";

import { GiftsSection } from "./GiftsSection";

const pixPayload = `000201${"1234567890".repeat(24)}6304ABCD`;

const gifts: GiftsConfig = {
  eyebrow: "PRESENTES",
  title: "Lista de presentes",
  message: { value: "Mensagem", status: "confirmed", placeholder: "" },
  platform: { value: null, status: "pending", placeholder: "" },
  stores: [],
  pendingMessage: "Selecione uma opção.",
  items: [
    {
      id: "buffet",
      title: "Garantir o primeiro lugar na fila do buffet",
      price: "R$177,92",
      image: { src: "/gift.jpg", alt: "Presente", width: 600, height: 600, status: "confirmed" },
      paymentLabel: "Escolher este presente",
    },
    {
      id: "valor-livre",
      title: "Não achou o presente perfeito?",
      price: "Valor livre",
      image: { src: "/gift.svg", alt: "Valor livre", width: 600, height: 600, status: "confirmed" },
      paymentLabel: "Escolher este presente",
      customAmount: true,
    },
  ],
};

function mockPixSuccess(amount = "177.92") {
  return vi.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        amount,
        pixCopyPaste: pixPayload,
        qrCode:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Crect width='220' height='220' fill='white'/%3E%3C/svg%3E",
        txid: "MSBUFFETTEST",
      }),
    ok: true,
  });
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

describe("GiftsSection Pix flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gera Pix automaticamente para presente fixo usando somente giftId", async () => {
    const response = deferred<{
      json: () => Promise<{ amount: string; pixCopyPaste: string; qrCode: string; txid: string }>;
      ok: boolean;
    }>();
    const fetchMock = vi.fn().mockReturnValue(response.promise);
    vi.stubGlobal("fetch", fetchMock);

    render(<GiftsSection gifts={gifts} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Escolher este presente" })[0]);

    expect(screen.getByText("Preparando seu Pix...")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pix/charges",
      expect.objectContaining({ body: JSON.stringify({ giftId: "buffet" }) }),
    );
    response.resolve({
      json: () =>
        Promise.resolve({
          amount: "177.92",
          pixCopyPaste: pixPayload,
          qrCode:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Crect width='220' height='220' fill='white'/%3E%3C/svg%3E",
          txid: "MSBUFFETTEST",
        }),
      ok: true,
    });
    expect(screen.queryByRole("button", { name: "Gerar Pix" })).not.toBeInTheDocument();
    expect(await screen.findByLabelText("Pix Copia e Cola")).toHaveValue(pixPayload);
  });

  it("mantém presente de valor livre sem gerar Pix antes do valor", async () => {
    const fetchMock = mockPixSuccess("250.00");
    vi.stubGlobal("fetch", fetchMock);

    render(<GiftsSection gifts={gifts} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Escolher este presente" })[1]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Gerar Pix" })).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Valor do presente"), "250,00");
    await userEvent.click(screen.getByRole("button", { name: "Gerar Pix" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pix/charges",
      expect.objectContaining({ body: JSON.stringify({ amount: "250.00", giftId: "valor-livre" }) }),
    );
  });

  it("mostra retry quando a geração falha", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ message: "Pix ainda não configurado." }), ok: false })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ amount: "177.92", pixCopyPaste: pixPayload, qrCode: "data:image/svg+xml,%3Csvg/%3E", txid: "MSRETRY" }),
        ok: true,
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<GiftsSection gifts={gifts} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Escolher este presente" })[0]);

    expect(await screen.findByText("Pix ainda não configurado.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByLabelText("Pix Copia e Cola")).toHaveValue(pixPayload);
  });

  it("copia o payload completo mesmo quando o campo mostra uma linha longa", async () => {
    vi.stubGlobal("fetch", mockPixSuccess());
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<GiftsSection gifts={gifts} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Escolher este presente" })[0]);
    await screen.findByLabelText("Pix Copia e Cola");
    await userEvent.click(screen.getByRole("button", { name: "Copiar código Pix" }));

    expect(writeText).toHaveBeenCalledWith(pixPayload);
    expect(screen.getAllByText("Código copiado")).toHaveLength(2);
  });
});
