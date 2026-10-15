import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { canonNoteSchema, productSchema, seriesSchema, dateSchema } from "./schema";
const root = resolve(import.meta.dirname, "..");
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), "utf8"));
const products = read("data/products.json").map((p: unknown) =>
  productSchema.parse(p),
);
const demo = read("data/demo.json").map((p: unknown) => productSchema.parse(p));
const series = read("data/series.json").map((s: unknown) =>
  seriesSchema.parse(s),
);
const canonNotes = read("data/canonNotes.json").map((n: unknown) =>
  canonNoteSchema.parse(n),
);
const demoNotes = read("data/canonNotesDemo.json").map((n: unknown) =>
  canonNoteSchema.parse(n),
);
function unique(items: any[], key: string, label: string) {
  const ids = items.map((x) => x[key]);
  if (new Set(ids).size !== ids.length) throw Error(`重复 ${label} ${key}`);
}
unique([...products, ...demo], "id", "商品");
unique([...products, ...demo], "slug", "商品");
unique(series, "id", "系列");
unique(series, "slug", "系列");
unique([...canonNotes, ...demoNotes], "id", "作者补充");
for (const n of [...canonNotes, ...demoNotes]) {
  for (const id of n.relatedProductIds)
    if (!products.some((p: any) => p.id === id))
      throw Error("作者补充引用无效商品 " + id);
  if (n.citation.publishedAt) dateSchema.parse(n.citation.publishedAt);
}
for (const p of [...products, ...demo]) {
  if (!series.some((s: any) => s.id === p.seriesId))
    throw Error("无效系列引用 " + p.id);
  for (const id of p.relatedProductIds)
    if (
      ![...products, ...demo].some((x: any) => x.id === id) ||
      (!p.isDemo && demo.some((x: any) => x.id === id))
    )
      throw Error("无效或示例商品引用 " + id);
  unique(p.sources, "id", "来源");
  for (const img of p.images)
    if (!existsSync(resolve(root, "../public" + img.path)))
      throw Error("缺少图片文件 " + img.path);
}
for (const s of series)
  for (const img of s.images)
    if (!existsSync(resolve(root, "../public" + img.path)))
      throw Error("缺少系列图片 " + img.path);
const content: any[] = [];
for (const collection of ["news", "wiki"]) {
  const entries = readdirSync(resolve(root, "content", collection))
    .filter((x) => x.endsWith(".md"))
    .map((file) => {
      const raw = readFileSync(
        resolve(root, "content", collection, file),
        "utf8",
      );
      const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!front) throw Error("缺少 frontmatter " + file);
      return { ...parse(front[1]), collection };
    });
  unique(entries, "slug", collection);
  content.push(...entries);
  for (const e of entries) {
    if (e.seriesId && !series.some((s: any) => s.id === e.seriesId))
      throw Error("资讯引用无效系列");
    for (const id of e.productIds || [])
      if (!products.some((p: any) => p.id === id))
        throw Error("资讯引用无效商品 " + id);
    for (const d of e.dates || []) {
      dateSchema.parse(d);
      new Intl.DateTimeFormat("zh-CN", { timeZone: d.timezone });
    }
    if (collection === "news" && !e.sources?.length)
      throw Error("真实资讯缺少来源");
  }
}
unique(content, "id", "内容");
if (
  content.some(
    (e) => e.collection === "wiki" && e.slug === "creator-notes",
  )
)
  throw Error("Wiki slug 与作者补充固定路由冲突 creator-notes");
if (
  products.some((p: any) => p.isDemo) ||
  series.some((s: any) => s.isDemo) ||
  canonNotes.some((n: any) => n.isDemo) ||
  demoNotes.some((n: any) => !n.isDemo)
)
  throw Error("真实内容文件不得混入示例数据");
console.log(
  `内容校验通过：${products.length} 商品，${series.length} 系列，${content.length} 内容文章，${canonNotes.length} 条作者补充，${demo.length} 独立示例。`,
);
