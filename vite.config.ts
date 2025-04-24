import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Disable rollup optimizations to avoid native dependencies
      treeshake: false,
      // Exclude native dependencies
      external: ['@rollup/rollup-linux-x64-gnu'],
    },
  },
})
