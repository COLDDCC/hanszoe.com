import type { Product, Series } from "./schema";
import { normalize } from "./catalog";

/**
 * 图录页的精简搜索索引。
 *
 * 过去图录页把完整 products + series（约 4.6MB）内联进 HTML，浏览器端每次筛选
 * 还要对每件商品重新做 NFKC 归一化、线性查找系列。这里在构建时只保留筛选与排序
 * 需要的字段，并把搜索字符串预先归一化。筛选与排序语义与 filterProducts /
 * filterProductsJa 完全一致（tests/catalog-index.test.ts 用真实数据逐一比对）。
 *
 * 本文件会打包进前端脚本：只能 import 类型与 catalog.ts 里的纯函数，不能引入
 * zod、数据文件或 Node 模块。
 */
export type IndexEntry = {
  /** 商品 ID，对应卡片的 data-product-id */
  id: string;
  /** 商品类型（保留原字段名，浏览器测试按 type 计数） */
  type: string;
  /** 预先归一化的搜索字符串：名称、别名、品牌、系列名与系列别名 */
  h: string;
  /** 首次发售年份（中文页无日期为 "unknown"，日文页为空字符串） */
  y: string;
  /** 已收录发行的销售方式 */
  m: string[];
  /** 收录日 createdAt */
  a: string;
  /** 初版发售日（可为空） */
  d: string;
  /** 按名称排序时使用的显示名 */
  n: string;
};

export type IndexOptions = {
  year: (p: Product) => string;
  date: (p: Product) => string;
  name: (p: Product) => string;
};

export function buildIndex(
  products: Product[],
  series: Series[],
  o: IndexOptions,
): IndexEntry[] {
  const byId = new Map(series.map((s) => [s.id, s]));
  return products.map((p) => {
    const s = byId.get(p.seriesId);
    return {
      id: p.id,
      type: p.type,
      h: normalize(
        [
          ...Object.values(p.names),
          ...p.aliases,
          p.manufacturer || "",
          p.publisher || "",
          s?.name || "",
          ...(s?.aliases || []),
        ].join(" "),
      ),
      y: o.year(p),
      m: [...new Set(p.releases.map((r) => r.salesMethod))],
      a: p.createdAt,
      d: o.date(p),
      n: o.name(p),
    };
  });
}

const groups = ["year", "type", "method"] as const;

export function filterIndex(
  entries: IndexEntry[],
  params: URLSearchParams,
  locale: string,
): IndexEntry[] {
  const words = normalize(params.get("q") || "")
    .split(" ")
    .filter(Boolean);
  const wanted = groups.map((g) => params.getAll(g));
  const out = entries.filter((e) => {
    if (!words.every((w) => e.h.includes(w))) return false;
    return groups.every((g, i) => {
      const values = wanted[i];
      if (!values.length) return true;
      const own = g === "year" ? [e.y] : g === "type" ? [e.type] : e.m;
      return values.some((v) => own.includes(v));
    });
  });
  const sort = params.get("sort") || "added";
  const collator = new Intl.Collator(locale);
  out.sort((a, b) =>
    sort === "name"
      ? collator.compare(a.n, b.n)
      : sort === "date"
        ? !a.d && !b.d
          ? 0
          : !a.d
            ? 1
            : !b.d
              ? -1
              : b.d.localeCompare(a.d)
        : b.a.localeCompare(a.a),
  );
  return out;
}

/** 首屏与每次「显示更多」渲染的卡片数 */
export const PAGE_SIZE = 60;
