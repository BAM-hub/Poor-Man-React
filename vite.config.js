// vite.config.js
import fs from "fs";
import { defineConfig } from "vite";
import transformAsync from "./scripts";
import { readFile } from "fs/promises";

export default defineConfig({
  plugins: [
    {
      name: "BAM-transform",
      resolveId(id) {
        if (id.endsWith(".bsx")) {
          return id;
        }
      },

      async load(id) {
        if (id.endsWith(".bsx")) {
          console.log("rerun load");
          const raw = await readFile(id, "utf-8");
          const fileName = id.split("/").at(-1);
          const transformed = await transformAsync(raw, fileName);
          return transformed;
        }
      },
      async transform(code, id) {
        const fileName = id.split("/").at(-1);
        const isTsx = fileName.split(".").at(-1) === "tsx";
        if (isTsx) {
          const transformed = await transformAsync(code, fileName);
          return {
            code: transformed,
          };
        }
      },
    },
  ],
});
