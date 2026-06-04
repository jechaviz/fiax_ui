import { describe, expect, test } from "bun:test";

describe("new form routes", () => {
  test("declares section create routes before id routes", async () => {
    const html = await Bun.file("index.html").text();

    for (const section of ["leads", "estimates", "contracts", "projects", "expenses", "transactions", "products"]) {
      expect(html.indexOf(`path: '/${section}/new'`)).toBeGreaterThan(-1);
      expect(html.indexOf(`path: '/${section}/new'`)).toBeLessThan(html.indexOf(`path: '/${section}/:id'`));
    }

    expect(html.indexOf("path: '/cfdi/egresos/new'")).toBeLessThan(html.indexOf("path: '/cfdi/egresos/:id'"));
    expect(html.indexOf("path: '/cfdi/traslado/new'")).toBeLessThan(html.indexOf("path: '/cfdi/traslado/:id'"));
    expect(html.indexOf("path: '/cfdi/pagos/new'")).toBeLessThan(html.indexOf("path: '/cfdi/pagos/:id'"));
    expect(html.indexOf("path: '/cfdi/nomina/new'")).toBeLessThan(html.indexOf("path: '/cfdi/nomina/:id'"));
  });
});
