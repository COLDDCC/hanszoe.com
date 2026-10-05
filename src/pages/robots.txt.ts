import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) => {
  const ok =
    !!site &&
    import.meta.env.PUBLIC_INDEXABLE === "true" &&
    process.env.INCLUDE_DEMO !== "true";
  return new Response(
    `User-agent: *\n${ok ? "Allow: /" : "Disallow: /"}\n${ok ? "Sitemap: " + new URL("/sitemap.xml", site) : ""}\n`,
    { headers: { "Content-Type": "text/plain" } },
  );
};
