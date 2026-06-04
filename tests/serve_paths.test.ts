import { describe, expect, test } from "bun:test";
import { resolve } from "path";
import { resolveStaticPath } from "../serve_paths";

describe("resolveStaticPath", () => {
  const root = resolve("c:/git/customers/yo/fiax");

  test("allows files inside the application root", () => {
    expect(resolveStaticPath(root, "/index.html")).toBe(resolve(root, "index.html"));
    expect(resolveStaticPath(root, "/css/00_core.css")).toBe(resolve(root, "css/00_core.css"));
  });

  test("blocks traversal attempts", () => {
    expect(resolveStaticPath(root, "/../../Windows/win.ini")).toBeNull();
    expect(resolveStaticPath(root, "/%2e%2e/%2e%2e/Windows/win.ini")).toBeNull();
    expect(resolveStaticPath(root, "/..%2f..%2fWindows/win.ini")).toBeNull();
  });

  test("rejects malformed escape sequences", () => {
    expect(resolveStaticPath(root, "/%E0%A4%A")).toBeNull();
  });
});
