import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'


const config = defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins:
    mode === 'test'
      ? [viteReact()]
      : [
          devtools(),
          nitro(),
          viteTsConfigPaths({
            projects: ['./tsconfig.json'],
          }),
          tailwindcss(),
          tanstackStart(),
          viteReact(),
        ],
  optimizeDeps: {
    exclude: ['@tanstack/start-server-core', '@tanstack/react-router'],
  },
  ssr: {
    noExternal: mode === 'test' ? true : undefined,
  },
  build: {
    rollupOptions: {
      external: ['pg', '@prisma/adapter-pg'],
    },
  },
  nitro: {
    externals: {
      trace: {
        include: ['pg', '@prisma/adapter-pg'],
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))

export default config
