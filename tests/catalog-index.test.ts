import { test } from "node:test";
import assert from "node:assert/strict";
import demo from "../src/data/demo.json";
import real from "../src/data/products.json";
import rawSeries from "../src/data/series.json";
import { productSchema, seriesSchema } from "../src/lib/schema";
import { displayName, filterProducts, firstDate, year } from "../src/lib/catalog";
import { filterProductsJa, jaName, jaYear } from "../src/lib/ja";
import { buildIndex, filterIndex } from "../src/lib/catalogIndex";

const series = rawSeries.map((x) => seriesSchema.parse(x));
const realProducts = real.map((x) => productSchema.parse(x));
const demoProducts = demo.map((x) => productSchema.parse(x));
const zhIndex = (list: typeof realProducts) =>
  buildIndex(list, series, { year, date: firstDate, name: displayName });
const jaIndex = (list: typeof realProducts) =>
  buildIndex(list, series, { year: jaYear, date: firstDate, name: jaName });

// 覆盖：空条件、各排序、关键词（中日英、全半角、品牌、系列名）、同组多选、跨组组合、无结果。
const cases = (list: typeof realProducts) => {
  const years = [...new Set(list.map(year))];
  const types = [...new Set(list.map((p) => p.type))];
  const methods = [
    ...new Set(list.flatMap((p) => p.releases.map((r) => r.salesMethod))),
  ];
  const out = [
    "",
    "sort=date",
    "sort=name",
    "q=1123",
    "q=ハンジ",
    "q=ＨＡＮＧＥ+ＺＯＥ",
    "q=hange zoë",
    "q=韩吉 徽章",
    "q=unfindable",
    "q=Good Smile",
    `method=${methods[0]}&method=${methods.at(-1)}`,
    `type=${types[0]}&type=${types[1]}&sort=date`,
  ];
  for (const y of years) out.push(`year=${y}`, `year=${y}&sort=name`);
  for (const t of types) out.push(`type=${t}`);
  for (const m of methods) out.push(`method=${m}&sort=date`);
  for (const s of series.slice(0, 15)) out.push(`q=${encodeURIComponent(s.name)}`);
  return out.map((q) => new URLSearchParams(q));
};

test("中文图录：精简索引与 filterProducts 结果和顺序完全一致", () => {
  for (const list of [realProducts, demoProducts]) {
    const index = zhIndex(list);
    for (const params of cases(list))
      assert.deepEqual(
        filterIndex(index, params, "zh-CN").map((e) => e.id),
        filterProducts(list, series, params).map((p) => p.id),
        params.toString(),
      );
  }
});

test("日文图录：精简索引与 filterProductsJa 结果和顺序完全一致", () => {
  for (const list of [realProducts, demoProducts]) {
    const index = jaIndex(list);
    for (const params of cases(list).concat(
      [...new Set(list.map(jaYear))].map((y) => new URLSearchParams({ year: y })),
    ))
      assert.deepEqual(
        filterIndex(index, params, "ja").map((e) => e.id),
        filterProductsJa(list, series, params).map((p) => p.id),
        params.toString(),
      );
  }
});

test("索引远小于完整数据，且不含示例条目", () => {
  const index = zhIndex(realProducts);
  const slim = JSON.stringify({ products: index }).length;
  const full = JSON.stringify({ products: realProducts, series }).length;
  assert.ok(slim * 5 < full, `slim=${slim} full=${full}`);
  assert.ok(index.every((e) => !e.id.startsWith("demo-")));
});
