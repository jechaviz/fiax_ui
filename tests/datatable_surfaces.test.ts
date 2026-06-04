import { describe, expect, test } from "bun:test";

async function loadDatatable() {
  globalThis.window = {
    fiax: { datatable: {} },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  } as any;

  for (const path of [
    "js/fiax_datatable_schema.js",
    "js/fiax_datatable_filters.js",
    "js/fiax_datatable_views.js",
    "js/fiax_datatable_runtime.js",
  ]) {
    const src = await Bun.file(path).text();
    new Function(src)();
  }

  return (globalThis.window as any).fiax.datatable;
}

describe("datatable surfaces", () => {
  test("uses collection schemas instead of invoice fallback", async () => {
    const datatable = await loadDatatable();

    const payments = datatable.schema.createColumnSchema({}, "paymentReceipts").map((column: any) => column.key);
    const payroll = datatable.schema.createColumnSchema({}, "payrollReceipts").map((column: any) => column.key);
    const leads = datatable.schema.createColumnSchema({}, "leads").map((column: any) => column.key);

    expect(payments).toContain("invoiceFolio");
    expect(payments).not.toContain("clientRfc");
    expect(payroll).toContain("employeeName");
    expect(leads).toContain("title");
  });

  test("resolves nested values used by alternate views", async () => {
    const datatable = await loadDatatable();
    const employeeColumn = { key: "employeeName" };
    const invoiceColumn = { key: "invoiceFolio" };

    expect(datatable.schema.resolveCellValue({ employee: { name: "Ana" } }, employeeColumn)).toBe("Ana");
    expect(datatable.schema.resolveCellValue({ relatedDocuments: [{ serie: "A", folio: "10" }] }, invoiceColumn)).toBe("A10");
  });

  test("runtime keeps persisted view keys on the v2 schema", async () => {
    const datatable = await loadDatatable();
    const methods = datatable.runtime.createMethods();

    expect(methods.columnStyle({ width: "minmax(200px, 1fr)" })).toEqual({
      width: "minmax(200px, 1fr)",
      minWidth: "minmax(200px, 1fr)",
    });
    expect(methods.storageKeys.call({ surfaceKey: "paymentReceipts" }).views).toBe("app-ui:datatable.views.v2.paymentReceipts");
  });
});
