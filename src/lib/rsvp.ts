export type RsvpPayload = {
  attendance: "yes" | "no";
  email: string;
  firstName: string;
  guestNames: string;
  lastName: string;
  message: string;
  phone: string;
};

export type RsvpResult =
  | { mode: "demo"; submitted: false }
  | { mode: "endpoint"; submitted: true };

export async function submitRsvp(
  payload: RsvpPayload,
  endpoint = "/api/rsvp",
): Promise<RsvpResult> {
  if (!endpoint) return { mode: "demo", submitted: false };

  const response = await fetch(endpoint, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Não foi possível enviar sua confirmação agora. Tente novamente em instantes.");
  }

  return { mode: "endpoint", submitted: true };
}
