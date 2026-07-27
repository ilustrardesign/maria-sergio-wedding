import { describe, expect, it } from "vitest";

import { createCalendarFile, createGoogleCalendarUrl } from "./calendar";

const event = {
  startDate: "2026-10-31",
  endDate: "2026-11-01",
  title: "Casamento de Maria e Sérgio",
  description: "Celebração de Maria e Sérgio.",
  location: "Cabedelo, Paraíba",
};

describe("calendar helpers", () => {
  it("gera um evento ICS de dia inteiro", async () => {
    const text = await createCalendarFile(event).text();
    expect(text).toContain("DTSTART;VALUE=DATE:20261031");
    expect(text).toContain("DTEND;VALUE=DATE:20261101");
    expect(text).toContain("SUMMARY:Casamento de Maria e Sérgio");
  });

  it("gera uma URL configurada para o Google Calendar", () => {
    const url = new URL(createGoogleCalendarUrl(event));
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("dates")).toBe("20261031/20261101");
    expect(url.searchParams.get("text")).toBe(event.title);
  });
});
