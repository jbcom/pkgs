import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { createDirectoryCollection } from "@lib/loaders";

const directory = createDirectoryCollection();

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/data/pages" }),
  schema: ({ image }) =>
    z.object({
      image: image().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = {
  directory,
  pages,
};
