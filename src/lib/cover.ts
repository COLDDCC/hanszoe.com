// 杂志封面式内容区（MagCover）的数据与选稿规则。资讯（中文）与周边（日文）共用同一套版式。
// 头条：第一条带图的条目；右栏：再 3 条带图条目；中栏：其余最新 listSize 条，只列日期与标题。
import type { CollectionEntry } from "astro:content";
import type { Product, Series } from "./schema";
import { webpSize } from "./imageSize";
import { cardSrc, cardSrcset } from "./images";
import { jaName, jaType, jaSeriesName, jaBrand, jaDate, jaPrice } from "./ja";

export type CoverImage = { src: string; alt: string; width?: number; height?: number; srcset?: string };
export type CoverItem = {
  href: string;
  kicker: string;
  title: string;
  /** ISO 日期（YYYY / YYYY-MM / YYYY-MM-DD） */
  date: string;
  summary?: string;
  byline?: string;
  /** 头条用大图；卡片用 thumb（没有则用 image） */
  image?: CoverImage;
  thumb?: CoverImage;
};

export function pickCover<T>(items: T[], hasImage: (t: T) => boolean, listSize = 5) {
  const withImage = items.filter(hasImage);
  const lead = withImage[0] as T | undefined;
  const rail = withImage.slice(1, 4);
  const shown = new Set<T>([...(lead ? [lead] : []), ...rail]);
  const textList = items.filter((t) => !shown.has(t)).slice(0, listSize);
  const used = new Set<T>([...shown, ...textList]);
  return { lead, rail, textList, used };
}

const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
/** 2026-10-15 → OCTOBER 15, 2026；2026-10 → OCTOBER 2026 */
export const longDate = (v: string) => {
  const [y, m, d] = v.split("-");
  if (m && d) return `${months[+m - 1]} ${+d}, ${y}`;
  if (m) return `${months[+m - 1]} ${y}`;
  return v;
};
/** 2026-10-15 → 2026.10.15 */
export const dotDate = (v: string) => v.replaceAll("-", ".");

type News = CollectionEntry<"news">;
export const newsHasCover = (n: News) => !!n.data.cover;
export const newsItem = (n: News): CoverItem => {
  const c = n.data.cover;
  const image = c ? { src: c.path, alt: c.alt, ...(webpSize(c.path) || {}) } : undefined;
  const org = n.data.sources[0]?.organization;
  return {
    href: "/news/" + n.data.slug + "/",
    kicker: n.data.category,
    title: n.data.title,
    date: n.data.publishedAt,
    summary: n.data.summary,
    byline: org ? "出处 · " + org : undefined,
    image,
  };
};

export const productHasImage = (p: Product) => !!p.images[0];
/** 日文版周边条目：日文商品名、日文类别、首发日期与官方价格。不翻译中文正文。 */
export const productItemJa = (p: Product, seriesList: Series[]): CoverItem => {
  const img = p.images[0];
  const s = seriesList.find((x) => x.id === p.seriesId);
  const first = p.releases.find((r) => r.kind === "初版") || p.releases[0];
  const sName = jaSeriesName(s);
  const maker = jaBrand(p.manufacturer) || jaBrand(p.publisher);
  const alt = `${jaName(p)}｜公式商品画像`;
  const summary = [sName && `シリーズ「${sName}」`, first && `初回発売 ${jaDate(first.releaseDate)}`, first && `公式価格 ${jaPrice(first)}`]
    .filter(Boolean)
    .join(" · ");
  return {
    href: "/ja/merch/" + p.slug + "/",
    kicker: jaType[p.type] ?? "グッズ",
    title: jaName(p),
    date: first?.releaseDate?.value || p.createdAt,
    summary,
    byline: maker ? "メーカー · " + maker : undefined,
    image: img ? { src: img.path, alt, width: img.width, height: img.height } : undefined,
    thumb: img ? { src: cardSrc(img), alt, width: img.width, height: img.height, srcset: cardSrcset(img) } : undefined,
  };
};
