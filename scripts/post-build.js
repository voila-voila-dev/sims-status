import { cpSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const clientDir = resolve("dist/client");
const shell = resolve(clientDir, "_shell.html");

// Copy _shell.html → index.html so Cloudflare Pages serves it as fallback
if (existsSync(shell)) {
  cpSync(shell, resolve(clientDir, "index.html"));
}

// Cloudflare Pages SPA fallback: serve index.html for all non-asset routes
writeFileSync(
  resolve(clientDir, "_redirects"),
  "/*  /index.html  200\n"
);
