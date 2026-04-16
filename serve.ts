
import { serve } from "bun";
import { join } from "path";

const PORT = 8888; // Fiax port
const ROOT = import.meta.dir;

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

    const filePath = join(ROOT, path);
    const file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    // Fallback for SPA routing
    const indexFile = Bun.file(join(ROOT, "index.html"));
    return new Response(indexFile);
  },
});

console.log(`Fiax running at http://localhost:${PORT}/`);
