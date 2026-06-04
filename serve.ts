
import { serve } from "bun";
import { isAbsolute, relative, resolve, sep } from "path";

const PORT = 8888; // Fiax port
const ROOT = resolve(import.meta.dir);

function resolveStaticPath(pathname: string) {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const target = resolve(ROOT, `.${decodedPath.replace(/\\/g, "/")}`);
  const rel = relative(ROOT, target);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    return null;
  }

  return target;
}

console.log(`Starting Fiax Bun server in ${ROOT}...`);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === "/") {
      return new Response("", {
        status: 302,
        headers: { Location: "/index.html" },
      });
    }

    const filePath = resolveStaticPath(path);
    if (!filePath) {
      return new Response("Forbidden", { status: 403 });
    }

    const file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    // Fallback for SPA routing
    const indexFile = Bun.file(resolve(ROOT, "index.html"));
    return new Response(indexFile);
  },
});

console.log(`Fiax running at http://localhost:${PORT}/`);
