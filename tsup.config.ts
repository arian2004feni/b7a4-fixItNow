import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"], // keep this as ESM
  target: "esnext", // must match with tsconfig.ts
  outDir: "dist",
  platform: "node",
  bundle: true,
  minify: true,
  splitting: false,
  sourcemap: true,
  // add this banner to shim require() for cjs dependencies
  banner: {
    js: /* ts */ `
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
    `,
  },
});