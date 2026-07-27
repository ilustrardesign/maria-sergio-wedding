export type GuestPersonalization = {
  guestName?: string;
  invitationCode?: string;
  maximumGuests?: number;
};

const SAFE_NAME = /^[\p{L}\p{M} .'-]{2,80}$/u;
const SAFE_CODE = /^[A-Z0-9-]{4,32}$/;

export function readGuestPersonalization(searchParams: URLSearchParams): GuestPersonalization {
  const guestName = searchParams.get("convidado")?.trim();
  const invitationCode = searchParams.get("convite")?.trim().toUpperCase();
  const rawMaximumGuests = Number.parseInt(searchParams.get("acompanhantes") ?? "", 10);

  return {
    guestName: guestName && SAFE_NAME.test(guestName) ? guestName : undefined,
    invitationCode:
      invitationCode && SAFE_CODE.test(invitationCode) ? invitationCode : undefined,
    maximumGuests:
      Number.isInteger(rawMaximumGuests) && rawMaximumGuests >= 0 && rawMaximumGuests <= 12
        ? rawMaximumGuests
        : undefined,
  };
}
