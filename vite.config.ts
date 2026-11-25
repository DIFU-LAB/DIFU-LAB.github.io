import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";
const root = import.meta.dirname;
const base = (process.env.PAGES_BASE_PATH || "/").replace(/\/+$/, "") + "/";
export default defineConfig({
  base,
  root: path.join(root, "client"),
  publicDir: path.join(root, "client/public"),
  plugins: [{name: "responsive-media", resolveId(id) { if (id === "virtual:responsive-media") return "\0virtual:responsive-media"; }, load(id) { if (id !== "\0virtual:responsive-media") return; const file = path.join(root, ".cache/responsive-media.json"); if (!fs.existsSync(file)) throw new Error("Run pnpm prepare:media before Vite"); const manifest = JSON.parse(fs.readFileSync(file, "utf8")); for (const entry of Object.values(manifest) as { fingerprint?: string }[]) delete entry.fingerprint; return `export default ${JSON.stringify(manifest)};`; }}, {name:"local-media-base", enforce:"pre", transform(code,id) {
    if (id.includes("node_modules") || !/\.(tsx?|json)$/.test(id)) return;
    if (base !== "/" && code.includes("/media/")) return { code: code.replaceAll("/media/", base+"media/"), map:null };
  }}, react(), tailwindcss()],
  resolve: {alias: {"@":path.join(root,"client/src"), "@shared":path.join(root,"shared"), "@content":path.join(root,"content")}},
  server: {fs:{allow:[root]}},
  build: {outDir:path.join(root,"dist"), emptyOutDir:true},
});
