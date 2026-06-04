import { describe, expect, test } from "bun:test";

async function loadCfdiModel() {
  globalThis.window = {
    fiax: {
      logic: {
        cfdi: {
          calculateTotals(items) {
            let subtotal = 0;
            let taxTotal = 0;
            for (const item of items) {
              subtotal += item.amount;
              taxTotal += (item.taxes || []).filter((tax) => !tax.isRetention).reduce((sum, tax) => sum + tax.amount, 0);
            }
            return { subtotal, discount: 0, taxTotal, retainedTotal: 0, localTaxTotal: 0, total: subtotal + taxTotal };
          },
        },
      },
    },
  };
  const src = await Bun.file("js/fiax_cfdi_model.js").text();
  new Function(src)();
  return globalThis.window.fiax.cfdiModel;
}

describe("cfdi model", () => {
  test("normalizes aliases and recalculates taxes", async () => {
    const model = await loadCfdiModel();
    const state = {
      data: {
        issuers: [{ id: "iss1", name: "ACME", rfc: "AAA010101AAA", taxRegime: "601", branches: [{ id: "br1", postalCode: "76000" }] }],
        users: [{ id: "cli1", type: "Client", name: "Cliente", rfc: "BBB010101BBB", taxRegime: "612", postalCode: "76100" }],
      },
    };

    const invoice = {
      issuerId: "iss1",
      branchId: "br1",
      receiver: { userId: "cli1" },
      currency: "MXN",
      lineItems: [{ quantity: 1, unitPrice: 100, taxes: [{ taxType: "IVA", rate: 0.16, amount: 0 }] }],
    };
    const normalized = model.normalizeInvoice(invoice, state);

    expect(normalized.issuer.nombre).toBe("ACME");
    expect(normalized.receiver.codigoPostal).toBe("76100");
    expect(normalized.items[0].importe).toBe(100);
    expect(normalized.taxes.groups[0].amount).toBe(16);
    expect(normalized.subTotal).toBe(100);
    expect(normalized.total).toBe(116);
    expect(normalized.moneda).toBe("MXN");
  });
});
