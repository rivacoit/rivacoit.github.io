import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        writing: resolve(import.meta.dirname, "writing/index.html"),
        "names-can-be-deceiving": resolve(import.meta.dirname, "writing/names-can-be-deceiving/index.html"),
      },
    },
  },
});
