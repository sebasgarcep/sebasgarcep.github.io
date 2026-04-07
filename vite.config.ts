import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import path from "path";
import { cp } from "fs/promises";

function copyPublicAssets() {
  return {
    name: "copy-public-assets",
    async closeBundle() {
      const source = path.resolve(__dirname, "public", "assets");
      const dest = path.resolve(__dirname, "dist", "public", "assets");
      await cp(source, dest, { recursive: true, force: true });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyPublicAssets()],
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  assetsInclude: ["src/**/*.md"],
});
