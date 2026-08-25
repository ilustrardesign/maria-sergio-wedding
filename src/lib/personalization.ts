export type GuestPersonalization = {
  guestName?: string;
  maximumGuests?: number;
};

const SAFE_NAME = /^[\p{L}\p{M} .'-]{2,80}$/u;

export function readGuestPersonalization(searchParams: URLSearchParams): GuestPersonalization {
  const guestName = searchParams.get("convidado")?.trim();
  const rawMaximumGuests = Number.parseInt(searchParams.get("acompanhantes") ?? "", 10);

  return {
    guestName: guestName && SAFE_NAME.test(guestName) ? guestName : undefined,
    maximumGuests:
      Number.isInteger(rawMaximumGuests) && rawMaximumGuests >= 0 && rawMaximumGuests <= 12
        ? rawMaximumGuests
        : undefined,
  };
}
