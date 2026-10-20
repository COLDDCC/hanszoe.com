import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { canonNoteSchema, productSchema, seriesSchema, dateSchema } from "./schema";
const root = resolve(import.meta.dirname, "..");
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), "utf8"));
import {
  jaSpecKey,
  jaType,
  jaSalesMethod,
  jaKind,
  jaUnit,
  jaTaxStatus,
  jaRegion,
  jaSeriesType,
  jaDoc,
  jaValue,
} from "./ja";
import { jaPhrase, jaRules } from "./jaPhrases";
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
      return { ...parse(front[1]), collection, file };
    });
  unique(entries, "slug", collection);
  content.push(...entries);
  for (const e of entries) {
    if (String(e.slug).startsWith(collection + "-"))
      throw Error("slug 重复了集合前缀 " + e.file + " -> " + e.slug);
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
// 日本語版（/ja/merch・/ja/series）はデータ本体の語彙に依存するので、欠けをビルド前に止める。
for (const p of products) {
  if (!p.names.ja) throw Error("日本語名がありません " + p.id);
  if (!jaType[p.type]) throw Error("商品タイプの日本語ラベル未定義 " + p.type);
  if (!jaRegion[p.region]) throw Error("地域の日本語ラベル未定義 " + p.region);
  for (const r of p.releases) {
    if (!jaKind[r.kind]) throw Error("発売区分の日本語ラベル未定義 " + r.kind);
    if (r.salesMethod && !jaSalesMethod[r.salesMethod])
      throw Error("販売形態の日本語ラベル未定義 " + r.salesMethod);
    for (const price of r.prices || []) {
      if (!jaUnit[price.unit]) throw Error("価格単位の日本語ラベル未定義 " + price.unit);
      if (!jaTaxStatus[price.taxStatus])
        throw Error("税表記の日本語ラベル未定義 " + price.taxStatus);
    }
  }
  for (const k of Object.keys(p.specifications))
    if (!jaSpecKey[k]) throw Error("仕様項目の日本語ラベル未定義 " + k + " @ " + p.id);
  const doc = jaDoc.products[p.id];
  if (doc)
    for (const k of Object.keys(doc.specs || {}))
      if (!(k in p.specifications))
        throw Error("日本語訳の仕様キーが実在しません " + k + " @ " + p.id);
}
for (const s of series) {
  if (!jaSeriesType[s.type]) throw Error("シリーズ区分の日本語ラベル未定義 " + s.type);
  if (jaDoc.series[s.id]?.description && s.isDemo)
    throw Error("示例シリーズに日本語訳 " + s.id);
}
for (const id of Object.keys(jaDoc.products))
  if (![...products, ...demo].some((p: any) => p.id === id))
    throw Error("日本語訳が実在しない商品IDを参照 " + id);
for (const id of Object.keys(jaDoc.series))
  if (!series.some((s: any) => s.id === id))
    throw Error("日本語訳が実在しないシリーズIDを参照 " + id);
const jaTranslated = Object.keys(jaDoc.products).filter(
  (id) => jaDoc.products[id].description,
).length;
// 日本語として提示する文字列に簡体字が混ざっていないか（翻訳層の出力チェック）。
const HANS = /[页标价售录档术约图质库发销显说别关组织后确认记获从传优备复头对导无时机权构样检类编网职联种简笔竞稳罗罚罢]/;
const checkJa = (s: string, where: string) => {
  const bad = [...new Set([...s].filter((c) => HANS.test(c)))].join("");
  if (bad) throw Error(`日本語文字列に簡体字 ${bad} @ ${where}`);
};
for (const [k, v] of Object.entries(jaPhrase)) checkJa(v, "定型文 " + k);
let hits = 0;
let total = 0;
const used = new Set<number>();
for (const p of products) {
  checkJa(p.names.ja, "商品名 " + p.id);
  const doc = jaDoc.products[p.id] || {};
  if (doc.description) checkJa(doc.description, "商品説明 " + p.id);
  for (const [i, m] of (p.missingFields || []).entries()) {
    total++;
    const t = jaValue(m);
    const fromDoc = doc.missing?.[i];
    if (t.translated) {
      hits++;
      checkJa(t.text, "未確認事項 " + p.id + "#" + i);
      if (!fromDoc) jaRules.forEach((r, n) => r.re.test(m) && used.add(n));
    }
  }
  for (const [k, v] of Object.entries(p.specifications)) {
    total++;
    const t = jaValue(v);
    if (!t.translated) continue;
    hits++;
    checkJa(t.text, "仕様値 " + p.id + "/" + k);
    if (!doc.specs?.[k]) jaRules.forEach((r, n) => r.re.test(String(v)) && used.add(n));
  }
}
const dead = jaRules
  .map((_, n) => n)
  .filter((n) => !used.has(n))
  .map((n) => jaRules[n].re.source.slice(0, 40));
console.log(
  `内容校验通过：${products.length} 商品，${series.length} 系列，${content.length} 内容文章，${canonNotes.length} 条作者补充，${demo.length} 独立示例。日语版：${products.length} 商品全部有日文名与日文标签，正文译文已登记 ${jaTranslated} 条，仕様値・未確認事項 ${hits}/${total} 件（${((hits / total) * 100).toFixed(1)}%）を日本語表示、訳語規則 ${used.size}/${jaRules.length} 件がデータ上で有効${dead.length ? "、未使用: " + dead.join(" | ") : ""}。`,
);
