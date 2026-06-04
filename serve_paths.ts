import { isAbsolute, relative, resolve, sep } from "path";

export function resolveStaticPath(root: string, pathname: string) {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const normalizedRoot = resolve(root);
  const target = resolve(normalizedRoot, `.${decodedPath.replace(/\\/g, "/")}`);
  const rel = relative(normalizedRoot, target);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    return null;
  }

  return target;
}

export function shouldServeSpaFallback(pathname: string) {
  return !/\.[A-Za-z0-9]+$/.test(pathname);
}
