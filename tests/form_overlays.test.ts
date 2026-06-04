import { describe, expect, test } from "bun:test";

describe("form and table overlays", () => {
  test("loads datatable modal and shared form control styles", async () => {
    const html = await Bun.file("index.html").text();
    const datatableModals = await Bun.file("css/50_datatable_modals.css").text();
    const formControls = await Bun.file("css/51_form_controls.css").text();

    expect(html).toContain("\"css/50_datatable_modals.css\"");
    expect(html).toContain("\"css/51_form_controls.css\"");
    expect(datatableModals).toContain(".app-table-settings-overlay");
    expect(datatableModals).toContain(".app-table-save-view-modal");
    expect(formControls).toContain("input.fiax-field");
    expect(formControls).toContain(".fiax-input-group");
    expect(formControls).toContain(".fiax-btn-primary");
  });
});
