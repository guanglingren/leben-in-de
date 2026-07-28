import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

const outputDir = new URL("../dist/", import.meta.url);
const serverDir = new URL("../dist/server/", import.meta.url);

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "server" || entry.name === ".openai") continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(absolute));
    else files.push(absolute);
  }

  return files;
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const rootPath = outputDir.pathname.replace(/^\/([A-Za-z]:)/, "$1");
const assets = {};

for (const file of await collect(rootPath)) {
  const route = `/${relative(rootPath, file).split(sep).join("/")}`;
  const bytes = await readFile(file);
  assets[route] = {
    mime: mimeTypes[extname(file)] || "application/octet-stream",
    body: bytes.toString("base64")
  };
}

const worker = `const assets = ${JSON.stringify(assets)};

function decode(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = assets[path] || (!path.includes(".") ? assets["/index.html"] : null);

    if (!asset) return new Response("Not found", { status: 404 });

    return new Response(decode(asset.body), {
      headers: {
        "content-type": asset.mime,
        "cache-control": path === "/index.html"
          ? "no-cache"
          : "public, max-age=31536000, immutable"
      }
    });
  }
};
`;

await mkdir(serverDir, { recursive: true });
await writeFile(new URL("index.js", serverDir), worker);
