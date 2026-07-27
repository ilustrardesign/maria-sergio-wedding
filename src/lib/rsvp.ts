export type RsvpPayload = {
  attendance: "yes" | "no";
  dietaryRestrictions: string;
  email: string;
  firstName: string;
  guests: number;
  lastName: string;
  message: string;
  phone: string;
};

export type RsvpResult =
  | { mode: "demo"; submitted: false }
  | { mode: "endpoint"; submitted: true };

export async function submitRsvp(
  payload: RsvpPayload,
  endpoint = process.env.NEXT_PUBLIC_RSVP_ENDPOINT,
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
