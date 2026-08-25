import { render, screen, waitFor } from "@testing-library/react";
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

describe("RsvpSection", () => {
  afterEach(() => {
    searchGuestsMock.mockReset();
    submitRsvpMock.mockReset();
    vi.restoreAllMocks();
  });

  it("separa busca, selecionados e bloqueia texto inventado", async () => {
    const user = userEvent.setup();
    searchGuestsMock.mockImplementation(async (_endpoint: string, query: string) => {
      if (query.includes("ped")) return [{ displayName: "Pedro Ivo", guestId: "guest-pedro" }];
      if (query.includes("kat")) return [{ displayName: "Katherine", guestId: "guest-katherine" }];
      return [];
    });

    render(<RsvpSection content={weddingContent} />);

    const search = screen.getByRole("combobox", { name: /Quem está confirmando presença/ });
    expect(screen.getAllByText("Digite o nome e selecione-o na lista.")).toHaveLength(1);
    expect(search).toHaveAttribute("placeholder", "Digite seu nome ou sobrenome");
    await user.type(search, "ped");

    expect(await screen.findByRole("option", { name: "Pedro Ivo" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Pedro Ivo" }));
    await waitFor(() => expect(search).toHaveValue(""));
    expect(screen.getByText("Pedro Ivo")).toBeInTheDocument();

    await user.type(search, "kat");
    expect(await screen.findByRole("option", { name: "Katherine" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Katherine" }));
    expect(screen.getByText("Katherine")).toBeInTheDocument();

    expect(screen.getByText("Pedro Ivo")).toBeInTheDocument();
    expect(screen.getByText("Katherine")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover Katherine" }));
    expect(screen.queryByText("Katherine")).not.toBeInTheDocument();

    await user.type(search, "Josefa");
    await waitFor(() => expect(screen.getByText("Nenhum convidado encontrado. Confira a escrita ou tente outro sobrenome.")).toBeInTheDocument());
    await user.keyboard("{Enter}");
    expect(screen.queryByText("Josefa")).not.toBeInTheDocument();
    await user.tab();
    await waitFor(() => expect(search).toHaveValue(""));
    expect(screen.queryByRole("option", { name: "Josefa" })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Selecione um nome da lista para adicioná-lo.")).toBeInTheDocument());
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

  it("envia presença individual no payload final", async () => {
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
    expect(screen.getByText("Presença confirmada.")).toBeInTheDocument();
  });
});
