import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/dev/email-preview", () => {
  it("renderiza o preview do convidado sem enviar nada", async () => {
    const response = GET(new Request("http://localhost/api/dev/email-preview?template=guest-yes"));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("Que alegria ter você conosco");
    expect(html).toContain("https://mariaesergio.com");
    expect(html).toContain("Com carinho,");
  });

  it("renderiza o preview administrativo com HTML inline", async () => {
    const response = GET(new Request("http://localhost/api/dev/email-preview?template=admin"));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Maria &amp; Sérgio");
    expect(html).toContain("style=");
    expect(html).not.toContain("<style");
  });
});
