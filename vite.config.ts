import { networkInterfaces } from "node:os";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function lanUrl(port: number): string {
  const nets = networkInterfaces();
  for (const list of Object.values(nets)) {
    for (const item of list ?? []) {
      if (item.family === "IPv4" && !item.internal) {
        return `http://${item.address}:${port}`;
      }
    }
  }
  return `http://localhost:${port}`;
}

const PORT = 5173;
const PAGES_URL = "https://ppklu99-cmyk.github.io/radio-paper/";
const onPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  plugins: [
    react(),
    ...(onPages
      ? [
          {
            name: "prefix-public-fonts",
            apply: "build" as const,
            transform(code: string, id: string) {
              if (!id.replaceAll("\\", "/").endsWith("src/styles/tokens.css")) return;
              return code.replaceAll('url("/fonts/', 'url("/radio-paper/fonts/');
            },
          },
        ]
      : []),
  ],
  base: onPages ? "/radio-paper/" : "/",
  define: {
    __LAN_URL__: JSON.stringify(onPages ? PAGES_URL : lanUrl(PORT)),
  },
  server: {
    host: true,
    port: PORT,
    proxy: {
      "/sync": "http://127.0.0.1:8787",
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    passWithNoTests: true,
  },
});
