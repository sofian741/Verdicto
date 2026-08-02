import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Plain Vite config for TanStack Start — no third-party wrapper package.
// Order matters: tsconfig paths + tailwind first, then tanstackStart, then React.
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Use our own SSR entry (src/server.ts) instead of the auto-generated one,
      // since it wraps responses with custom error handling.
      server: { entry: "server" },
    }),
    viteReact(),
  ],
  server: {
    port: 5173,
  },
});
