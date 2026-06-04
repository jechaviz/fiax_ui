import { describe, expect, test } from "bun:test";

async function loadApi() {
  const state = {
    demoMode: true,
    demoData: { users: [], invoices: [], issuers: [], products: [] },
    upsertLocal(collection, record) {
      const key = collection === "clients" ? "users" : collection;
      if (!this.demoData[key]) this.demoData[key] = [];
      const next = collection === "clients" ? { ...record, type: "Client" } : record;
      const idx = this.demoData[key].findIndex((item) => item.id === next.id);
      if (idx >= 0) this.demoData[key][idx] = next;
      else this.demoData[key].push(next);
    },
    persistDemoData() {},
  };

  globalThis.window = {
    fiax: {
      config: {},
      state: { ensureState: () => state },
      logic: { cfdi: { validate: () => ({ isValid: true, errors: {} }) } },
      cfdiModel: { normalizeInvoice: (invoice) => invoice },
    },
  };

  const src = await Bun.file("js/fiax_api.js").text();
  new Function(src)();
  return { api: globalThis.window.fiax.api, state };
}

describe("fiax api", () => {
  test("persists demo clients through state", async () => {
    const { api, state } = await loadApi();
    const result = await api.saveRecord("clients", { id: "cli1", name: "Cliente Uno" });

    expect(result.ok).toBe(true);
    expect(result.localOnly).toBe(true);
    expect(state.demoData.users[0]).toMatchObject({ id: "cli1", name: "Cliente Uno", type: "Client" });
  });

  test("does not fake stamping without fiscal backend", async () => {
    const { api } = await loadApi();
    const result = await api.stampInvoice({ id: "inv1" });

    expect(result.ok).toBe(false);
    expect(result.requiresBackend).toBe(true);
  });
});
