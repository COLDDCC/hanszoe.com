import type { Product, Series, Release } from "./schema";
// 搜索归一化：全半角、大小写、空格之外，再去掉名字里的间隔号（ハンジ・ゾエ／韩吉·佐耶 → ハンジゾエ／韩吉佐耶）
// 和拉丁字母的附加符号（Zoë → zoe）。日文浊音点（U+3099）不在去除范围内，ジ不会被当成シ。
export const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .replace(/[・·‧•]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export const displayName = (p: Product) =>
  p.names.zh || p.names.ja || p.names.en;
export const firstDate = (p: Product) =>
  p.releases.find((r) => r.kind === "初版")?.releaseDate?.value || "";
export const year = (p: Product) => firstDate(p).slice(0, 4) || "unknown";
const unusable = /^(未注明|待核实|未知)$/;
export const usableBrand = (v?: string | null) =>
  v && !unusable.test(v.trim()) ? v : "";
export const brand = (p: Product) =>
  usableBrand(p.manufacturer) || usableBrand(p.publisher);
export const priceText = (r: Release) =>
  r.priceStatus === "notSoldSeparately"
    ? "购买特典，非单独销售"
    : r.priceStatus === "unknown"
      ? "官方原价待核实"
      : r.prices
          .map(
            (p) =>
              `${new Intl.NumberFormat("zh-CN", { style: "currency", currency: p.currency, maximumFractionDigits: p.currency === "JPY" || p.currency === "KRW" ? 0 : 2 }).format(p.amount / (p.currency === "JPY" || p.currency === "KRW" ? 1 : 100))} / ${p.unit}（${p.taxStatus}${p.quantity ? ` · ${p.quantity}件` : ""}）`,
          )
          .join("；");
const clip = (s: string, max: number) =>
  s.length <= max ? s : s.slice(0, max - 1).replace(/[，、。；\s]+$/, "") + "…";
/** Short search-result description (meta description), built from structured fields. */
export const seoDescription = (p: Product, seriesName?: string) => {
  const first = p.releases.find((r) => r.kind === "初版");
  const maker = brand(p);
  const y = year(p);
  const parts = [
    `${displayName(p)}${p.names.ja ? `（${p.names.ja}）` : ""}`,
    [maker, seriesName && `「${seriesName}」系列`, p.type].filter(Boolean).join(" · "),
    y !== "unknown" ? `${y} 年首次发售` : "",
    first && first.priceStatus === "known" ? `官方原价 ${priceText(first)}` : "",
    p.releases.length > 1 ? `共 ${p.releases.length} 次发行记录` : "",
  ].filter(Boolean);
  return clip(parts.join("，") + "。附官方出处。", 150);
};
export const dateText = (d: Release["releaseDate"]) =>
  d ? d.value.replace(/-/g, ".") : "日期待确认";
export function filterProducts(
  products: Product[],
  series: Series[],
  params: URLSearchParams,
) {
  const query = normalize(params.get("q") || "");
  const words = query.split(" ").filter(Boolean);
  const groups = ["year", "type", "method"];
  let out = products.filter((p) => {
    const s = series.find((s) => s.id === p.seriesId);
    const hay = normalize(
      [
        ...Object.values(p.names),
        ...p.aliases,
        p.manufacturer || "",
        p.publisher || "",
        s?.name || "",
        ...(s?.aliases || []),
      ].join(" "),
    );
    if (!words.every((w) => hay.includes(w))) return false;
    return groups.every((g) => {
      const values = params.getAll(g);
      if (!values.length) return true;
      const own =
        g === "year"
          ? [year(p)]
          : g === "type"
            ? [p.type]
            : p.releases.map((r) => r.salesMethod);
      return values.some((v) => own.includes(v));
    });
  });
  const sort = params.get("sort") || "added";
  out.sort((a, b) =>
    sort === "name"
      ? displayName(a).localeCompare(displayName(b), "zh-CN")
      : sort === "date"
        ? !firstDate(a) && !firstDate(b)
          ? 0
          : !firstDate(a)
            ? 1
            : !firstDate(b)
              ? -1
              : firstDate(b).localeCompare(firstDate(a))
        : b.createdAt.localeCompare(a.createdAt),
  );
  return out;
}

