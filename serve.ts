
import { serve } from "bun";
import { resolve } from "path";
import { resolveStaticPath, shouldServeSpaFallback } from "./serve_paths";
import { resolveServerPort } from "./server_config";

const PORT = resolveServerPort(Bun.env.PORT);
const ROOT = resolve(import.meta.dir);

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

    const filePath = resolveStaticPath(ROOT, path);
    if (!filePath) {
      return new Response("Forbidden", { status: 403 });
    }

    const file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    if (!shouldServeSpaFallback(path)) {
      return new Response("Not found", { status: 404 });
    }

    // Fallback for SPA routing
    const indexFile = Bun.file(resolve(ROOT, "index.html"));
    return new Response(indexFile);
  },
});

console.log(`Fiax running at http://localhost:${PORT}/`);
