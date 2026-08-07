// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://muse.oriz.in',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwind()],
  },
})
