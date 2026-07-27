// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  server: {
    allowedHosts: true // Esto solucionará el error "Blocked request"
  },
  vite: {
    plugins: [tailwindcss()],
  },
});