import { describe, expect, test } from "bun:test";

describe("datatable toolbar", () => {
  test("loads the dedicated toolbar stylesheet", async () => {
    const html = await Bun.file("index.html").text();
    const css = await Bun.file("css/48_datatable_toolbar.css").text();

    expect(html).toContain("\"css/48_datatable_toolbar.css\"");
    expect(css).toContain(".app-data-table-shell.is-toolbar-expanded .app-toolbar-onhover");
    expect(css).toContain(".app-table-view-trigger > span:first-child");
    expect(css).toContain(".app-toolbar-new-record");
  });
});
