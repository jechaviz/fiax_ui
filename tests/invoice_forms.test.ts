import { describe, expect, test } from "bun:test";

describe("invoice form styling", () => {
  test("loads native control and line item layout styles", async () => {
    const html = await Bun.file("index.html").text();
    const css = await Bun.file("css/49_invoice_forms.css").text();
    const lineItems = await Bun.file("features/invoice/form/LineItemsSection.vue").text();

    expect(html).toContain("\"css/49_invoice_forms.css\"");
    expect(css).toContain("input.app-input-field");
    expect(css).toContain(".fiax-line-row");
    expect(css).toContain(".fiax-line-description > div > div");
    expect(lineItems).toContain("fiax-line-items");
  });
});
