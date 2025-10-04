import path from 'path'
import { defineConfig } from 'vite'
// Optional: if vite-plugin-pwa is installed in the subproject, uncomment and configure below
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: path.resolve(__dirname),
  // Allow overriding the base at build time via the VITE_BASE env var or BASE_URL
  // Useful when deploying to GitHub Pages under a repo subpath (e.g. /<repo>/)
  base: process.env.VITE_BASE || process.env.BASE_URL || '/',
  server: {
    host: true, // listen on all addresses, required for devcontainers
    port: 5173,
    strictPort: true // fail if port is taken instead of auto-picking another
  },
  // build: { outDir: 'dist' },
  // plugins: [VitePWA({/* ... */})]
})
