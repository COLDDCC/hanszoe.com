import type { Product, Series, Release } from "./schema";
export const normalize = (s: string) =>
  s.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
export const displayName = (p: Product) =>
  p.names.zh || p.names.ja || p.names.en;
export const firstDate = (p: Product) =>
  p.releases.find((r) => r.kind === "初版")?.releaseDate?.value || "";
export const year = (p: Product) => firstDate(p).slice(0, 4) || "unknown";
export const priceText = (r: Release) =>
  r.priceStatus === "notSoldSeparately"
    ? "购买特典，非单独销售"
    : r.priceStatus === "unknown"
      ? "官方原价待核实"
      : r.prices
          .map(
            (p) =>
              `${new Intl.NumberFormat("zh-CN", { style: "currency", currency: p.currency, maximumFractionDigits: p.currency === "JPY" || p.currency === "KRW" ? 0 : 2 }).format(p.amount / (p.currency === "JPY" || p.currency === "KRW" ? 1 : 100))} ${p.currency} / ${p.unit}（${p.taxStatus}${p.quantity ? ` · ${p.quantity}件` : ""}）`,
          )
          .join("；");
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

