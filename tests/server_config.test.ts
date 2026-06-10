import { expect, test } from "bun:test";
import { DEFAULT_PORT, resolveServerPort } from "../server_config";

test("uses the default server port when none is configured", () => {
  expect(resolveServerPort(undefined)).toBe(DEFAULT_PORT);
});

test("accepts a valid configured server port", () => {
  expect(resolveServerPort("9949")).toBe(9949);
});

test("rejects invalid configured server ports", () => {
  expect(resolveServerPort("0")).toBe(DEFAULT_PORT);
  expect(resolveServerPort("70000")).toBe(DEFAULT_PORT);
  expect(resolveServerPort("abc")).toBe(DEFAULT_PORT);
});
