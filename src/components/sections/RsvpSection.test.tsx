import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { weddingContent } from "@/content/wedding";

const searchGuestsMock = vi.fn();
const submitRsvpMock = vi.fn();

vi.mock("@/lib/guests", async () => {
  const actual = await vi.importActual<typeof import("@/lib/guests")>("@/lib/guests");
  return {
    ...actual,
    searchGuests: (...args: Parameters<typeof searchGuestsMock>) => searchGuestsMock(...args),
  };
});

vi.mock("@/lib/rsvp", () => ({
  submitRsvp: (...args: Parameters<typeof submitRsvpMock>) => submitRsvpMock(...args),
}));

import { RsvpSection } from "./RsvpSection";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("RsvpSection", () => {
  afterEach(() => {
    searchGuestsMock.mockReset();
    submitRsvpMock.mockReset();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("remove o helper fixo e mostra apenas estados reais", async () => {
    const user = userEvent.setup();
    searchGuestsMock.mockResolvedValue([]);

    render(<RsvpSection content={weddingContent} />);

    const search = screen.getByRole("combobox", { name: /Quem está confirmando presença/ });
    expect(screen.queryByText("Digite o nome e selecione-o na lista.")).not.toBeInTheDocument();
    expect(screen.queryByText("Selecione um nome da lista para adicioná-lo.")).not.toBeInTheDocument();
    expect(search).toHaveAttribute("placeholder", "Digite seu nome ou sobrenome");

    await user.type(search, "p");
    expect(screen.queryByText("Buscando...")).not.toBeInTheDocument();
    expect(screen.queryByText("Não encontramos esse nome.")).not.toBeInTheDocument();
  });

  it("debounceia a busca e ignora resposta antiga", async () => {
    vi.useFakeTimers();
    const ped = createDeferred<Array<{ displayName: string; guestId: string }>>();
    const pedro = createDeferred<Array<{ displayName: string; guestId: string }>>();

    searchGuestsMock.mockImplementation((_endpoint: string, query: string) => {
      if (query === "ped") return ped.promise;
      if (query === "pedro") return pedro.promise;
      return Promise.resolve([]);
    });

    render(<RsvpSection content={weddingContent} />);

    const search = screen.getByRole("combobox", { name: /Quem está confirmando presença/ });
    fireEvent.change(search, { target: { value: "ped" } });
    expect(searchGuestsMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(274);
    expect(searchGuestsMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(searchGuestsMock).toHaveBeenCalledTimes(1);

    fireEvent.change(search, { target: { value: "pedro" } });
    vi.advanceTimersByTime(275);
    expect(searchGuestsMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      ped.resolve([{ displayName: "Padre Renne Viana", guestId: "guest-padre" }]);
      await Promise.resolve();
    });
    expect(screen.queryByRole("option", { name: "Padre Renne Viana" })).not.toBeInTheDocument();

    await act(async () => {
      pedro.resolve([{ displayName: "Pedro Ivo", guestId: "guest-pedro" }]);
      await Promise.resolve();
    });
    expect(screen.getByRole("option", { name: "Pedro Ivo" })).toBeInTheDocument();
  });

  it("navega por teclado sem criar nomes livres", async () => {
    const user = userEvent.setup();
    searchGuestsMock.mockImplementation(async (_endpoint: string, query: string) => {
      if (query.includes("ped")) {
        return [
          { displayName: "Pedro Ivo", guestId: "guest-pedro" },
          { displayName: "Pedro José", guestId: "guest-pedro-jose" },
        ];
      }
      return [];
    });

    render(<RsvpSection content={weddingContent} />);

    const search = screen.getByRole("combobox", { name: /Quem está confirmando presença/ });
    await user.type(search, "ped");

    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(search).toHaveAttribute("aria-activedescendant", "rsvp-guest-listbox-option-guest-pedro");

    await user.keyboard("{ArrowDown}");
    expect(search).toHaveAttribute("aria-activedescendant", "rsvp-guest-listbox-option-guest-pedro-jose");

    await user.keyboard("{ArrowUp}");
    expect(search).toHaveAttribute("aria-activedescendant", "rsvp-guest-listbox-option-guest-pedro");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(search).not.toHaveAttribute("aria-activedescendant");
  });

  it("envia presença individual no payload final e mostra copy contextual", async () => {
    const user = userEvent.setup();
    searchGuestsMock.mockImplementation(async (_endpoint: string, query: string) => {
      if (query.includes("ped")) return [{ displayName: "Pedro Ivo", guestId: "guest-pedro" }];
      if (query.includes("kat")) return [{ displayName: "Katherine", guestId: "guest-katherine" }];
      return [];
    });
    submitRsvpMock.mockResolvedValue({ adminEmail: "sent", emailNotificationSent: true, guestEmail: "sent", id: "row-1", mode: "endpoint", persisted: true, submitted: true });

    render(<RsvpSection content={weddingContent} />);

    const search = screen.getByRole("combobox", { name: /Quem está confirmando presença/ });
    await user.type(search, "ped");
    await user.click(await screen.findByRole("option", { name: "Pedro Ivo" }));

    await user.type(search, "kat");
    await user.click(await screen.findByRole("option", { name: "Katherine" }));

    await user.click(screen.getByLabelText("Pedro Ivo - Estará presente"));
    await user.click(screen.getByLabelText("Katherine - Não poderá comparecer"));

    await user.type(screen.getByRole("textbox", { name: /Telefone/ }), "+55 83 99999-9999");
    await user.click(screen.getByRole("button", { name: "Confirmar presença" }));

    await waitFor(() => expect(submitRsvpMock).toHaveBeenCalledTimes(1));
    expect(submitRsvpMock).toHaveBeenCalledWith(
      {
        email: "",
        guests: [
          { attendance: "yes", guestId: "guest-pedro" },
          { attendance: "no", guestId: "guest-katherine" },
        ],
        message: "",
        phone: "+55 83 99999-9999",
      },
      "/api/rsvp",
    );
    expect(screen.getByText("Respostas registradas com sucesso. Obrigado por nos avisar.")).toBeInTheDocument();
  });

  it("mostra copy de presença confirmada quando todos dizem yes", async () => {
    const user = userEvent.setup();
    searchGuestsMock.mockResolvedValue([{ displayName: "Pedro Ivo", guestId: "guest-pedro" }]);
    submitRsvpMock.mockResolvedValue({ adminEmail: "sent", emailNotificationSent: true, guestEmail: "sent", id: "row-1", mode: "endpoint", persisted: true, submitted: true });

    render(<RsvpSection content={weddingContent} />);

    const search = screen.getByRole("combobox", { name: /Quem está confirmando presença/ });
    await user.type(search, "ped");
    await user.click(await screen.findByRole("option", { name: "Pedro Ivo" }));
    await user.click(screen.getByLabelText("Pedro Ivo - Estará presente"));
    await user.type(screen.getByRole("textbox", { name: /Telefone/ }), "+55 83 99999-9999");
    await user.click(screen.getByRole("button", { name: "Confirmar presença" }));

    await waitFor(() => expect(screen.getByText("Presença confirmada. Que alegria ter você conosco!")).toBeInTheDocument());
  });

  it("mostra copy de resposta recebida quando todos dizem no", async () => {
    const user = userEvent.setup();
    searchGuestsMock.mockResolvedValue([{ displayName: "Katherine", guestId: "guest-katherine" }]);
    submitRsvpMock.mockResolvedValue({ adminEmail: "sent", emailNotificationSent: false, guestEmail: "skipped", id: "row-1", mode: "endpoint", persisted: true, submitted: true });

    render(<RsvpSection content={weddingContent} />);

    const search = screen.getByRole("combobox", { name: /Quem está confirmando presença/ });
    await user.type(search, "kat");
    await user.click(await screen.findByRole("option", { name: "Katherine" }));
    await user.click(screen.getByLabelText("Katherine - Não poderá comparecer"));
    await user.type(screen.getByRole("textbox", { name: /Telefone/ }), "+55 83 99999-9999");
    await user.click(screen.getByRole("button", { name: "Confirmar presença" }));

    await waitFor(() => expect(screen.getByText("Resposta recebida. Obrigado por nos avisar.")).toBeInTheDocument());
  });
});
