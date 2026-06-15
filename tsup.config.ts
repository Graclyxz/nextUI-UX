import { defineConfig } from 'tsup'

// Per-file output (no bundling) preserves each module's 'use client' directive,
// so Next.js Server Components can import the static pieces without a client boundary.
export default defineConfig({
  entry: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.*',
    '!src/**/*.stories.*',
    '!src/**/*.d.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: false,
  external: ['react', 'react-dom'],
})
