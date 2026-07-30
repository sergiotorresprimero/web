// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Coloca aquí tu dominio o la URL temporal de tu túnel de Cloudflare
  site: 'https://nice-minute-abc-lined.trycloudflare.com',

  integrations: [svelte()],
  server: {
    allowedHosts: true // Esto solucionará el error "Blocked request"
  },
  vite: {
    plugins: [tailwindcss()],
  },
});