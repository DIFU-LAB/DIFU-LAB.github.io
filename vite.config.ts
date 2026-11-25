import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
const root = import.meta.dirname;
const base = (process.env.PAGES_BASE_PATH || "/").replace(/\/+$/, "") + "/";
export default defineConfig({
  base,
  root: path.join(root, "client"),
  publicDir: path.join(root, "client/public"),
  plugins: [{name:"local-media-base", enforce:"pre", transform(code,id) {
    if (id.includes("node_modules") || !/\.(tsx?|json)$/.test(id)) return;
    if (base !== "/" && code.includes("/media/")) return { code: code.replaceAll("/media/", base+"media/"), map:null };
  }}, react(), tailwindcss()],
  resolve: {alias: {"@":path.join(root,"client/src"), "@shared":path.join(root,"shared"), "@content":path.join(root,"content")}},
  server: {fs:{allow:[root]}},
  build: {outDir:path.join(root,"dist"), emptyOutDir:true},
});
