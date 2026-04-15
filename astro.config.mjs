// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import { ViteToml } from "vite-plugin-toml";
import tailwindcss from "@tailwindcss/vite";

// jbcom/pkgs — package index site
// Served at https://jonbogaty.com/pkgs/ via GitHub Pages custom-domain
// routing. jbcom.github.io/pkgs/ 301-redirects here automatically.

export default defineConfig({
  site: "https://jonbogaty.com",
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
