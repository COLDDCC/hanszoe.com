import type { APIRoute } from "astro";
import { products, series, includeDemo } from "../lib/data";
import { getCollection } from "astro:content";
export const GET: APIRoute = async ({ site }) => {
  const fixed = ["/", "/merch/", "/series/", "/news/", "/wiki/", "/about/"];
  const news = await getCollection("news", (e) => !e.data.isDemo);
  const wiki = await getCollection("wiki", (e) => !e.data.isDemo);
  const paths = [
    ...fixed,
    ...products.filter((p) => !p.isDemo).map((p) => "/merch/" + p.slug + "/"),
    ...series.map((s) => "/series/" + s.slug + "/"),
    ...news.map((n) => "/news/" + n.data.slug + "/"),
    ...wiki.map((w) => "/wiki/" + w.data.slug + "/"),
  ];
  const urls =
    site && !includeDemo
      ? paths
          .map(
            (p) =>
              `<url><loc>${new URL(p, site).href.replace(/&/g, "&amp;")}</loc></url>`,
          )
          .join("")
      : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
