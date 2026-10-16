import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from "astro/loaders";
const source = z.object({
  title: z.string(),
  url: z.url(),
  organization: z.string(),
  checkedAt: z.string(),
});
const common = {
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  sources: z.array(source),
  updatedAt: z.string(),
  isDemo: z.boolean().default(false),
};
const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    ...common,
    category: z.enum(["新品", "预订", "再贩", "活动", "动画", "连载"]),
    publishedAt: z.string(),
    cover: z
      .object({
        path: z.string(),
        alt: z.string(),
        sourceUrl: z.string().optional(),
        credit: z.string().optional(),
      })
      .optional(),
    seriesId: z.string().nullable().default(null),
    productIds: z.array(z.string()).default([]),
    dates: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          precision: z.enum(["year", "month", "day"]),
          timezone: z.string(),
        }),
      )
      .default([]),
    salesMethod: z.string().optional(),
    region: z.string().optional(),
  }),
});
const wiki = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wiki" }),
  schema: z.object({ ...common, spoiler: z.enum(["无", "轻微", "重大"]) }),
});
export const collections = { news, wiki };
