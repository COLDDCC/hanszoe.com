import type { APIRoute } from "astro";
import { canonNotes, products, series, includeDemo } from "../lib/data";
import { getCollection } from "astro:content";
export const GET: APIRoute = async ({ site }) => {
  const fixed = ["/", "/merch/", "/series/", "/news/", "/wiki/", "/about/"];
  const jaFixed = ["/ja/", "/ja/merch/", "/ja/series/"];
  if (canonNotes.length) fixed.push("/wiki/creator-notes/");
  const news = await getCollection("news", (e) => !e.data.isDemo);
  const wiki = await getCollection("wiki", (e) => !e.data.isDemo);
  const live = products.filter((p) => !p.isDemo);
  const seriesUpdated = new Map<string, string>();
  for (const p of live)
    if ((seriesUpdated.get(p.seriesId) || "") < p.updatedAt)
      seriesUpdated.set(p.seriesId, p.updatedAt);
  const entries: [string, string?][] = [
    ...fixed.map((p): [string] => [p]),
    ...jaFixed.map((p): [string] => [p]),
    ...live.map((p): [string, string] => ["/merch/" + p.slug + "/", p.updatedAt]),
    ...live.map((p): [string, string] => ["/ja/merch/" + p.slug + "/", p.updatedAt]),
    ...series.map((s): [string, string?] => ["/series/" + s.slug + "/", seriesUpdated.get(s.id)]),
    ...series.map((s): [string, string?] => ["/ja/series/" + s.slug + "/", seriesUpdated.get(s.id)]),
    ...news.map((n): [string, string?] => ["/news/" + n.data.slug + "/", /^\d{4}-\d{2}-\d{2}$/.test(String(n.data.publishedAt)) ? String(n.data.publishedAt) : undefined]),
    ...wiki.map((w): [string] => ["/wiki/" + w.data.slug + "/"]),
  ];
  const urls =
    site && !includeDemo
      ? entries
          .map(
            ([p, lastmod]) =>
              `<url><loc>${new URL(p, site).href.replace(/&/g, "&amp;")}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
          )
          .join("")
      : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
