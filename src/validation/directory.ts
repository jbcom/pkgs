// Content-collection schemas must use Astro's bundled Zod instance, not the
// standalone `zod` dependency. `astro:content` composes these with its own
// `image()` schema, and Zod rejects schemas built by a different instance
// ("expected a Zod schema") whenever the two majors diverge — Astro pins v3
// while the site depends on v4 for its non-content validation.
import { z } from "astro:content";

export const directorySchema = (imageSchema: z.ZodTypeAny) =>
  z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    icon: z.string().optional(),
    image: imageSchema.optional(),
    link: z.string().url().optional(),
    featured: z.boolean().default(false),
  });