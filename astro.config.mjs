// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Coloca aquí tu dominio o la URL temporal de tu túnel de Cloudflare
  site: 'https://draw-strategy-falling-thanks.trycloudflare.com',

  integrations: [svelte()],
  server: {
    allowedHosts: true //
  },
  vite: {
    plugins: [tailwindcss()],
  },
});