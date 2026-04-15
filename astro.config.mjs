// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import { ViteToml } from "vite-plugin-toml";
import tailwindcss from "@tailwindcss/vite";

// jbcom/pkgs — package index site
// Served at https://jbcom.github.io/pkgs per Astro's GitHub Pages guide.

export default defineConfig({
  site: "https://jbcom.github.io",
  base: "/pkgs",
  integrations: [
    vue(),
    mdx(),
    icon({
      include: { tabler: ["*"] },
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss(), ViteToml()],
  },
});
