export const DEFAULT_PORT = 8888;

export function resolveServerPort(value: string | undefined, fallback = DEFAULT_PORT) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return fallback;
  }

  return parsed;
}
