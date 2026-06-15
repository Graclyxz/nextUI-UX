import { defineConfig } from 'tsup'
import { preserveDirectivesPlugin } from 'esbuild-plugin-preserve-directives'

// Emits ESM + CJS with type declarations. preserveDirectivesPlugin keeps per-file
// 'use client' banners so server components can import the static pieces.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  esbuildPlugins: [
    preserveDirectivesPlugin({
      directives: ['use client', 'use server'],
      include: /\.(ts|tsx)$/,
      exclude: /node_modules/,
    }),
  ],
})
