import { test } from "node:test";
import assert from "node:assert/strict";
import raw from "../src/data/demo.json";
import real from "../src/data/products.json";
import rawSeries from "../src/data/series.json";
import {
  productSchema,
  seriesSchema,
  releaseSchema,
  dateSchema,
} from "../src/lib/schema";
import { filterProducts, priceText } from "../src/lib/catalog";
const products = raw.map((x) => productSchema.parse(x));
const series = rawSeries.map((x) => seriesSchema.parse(x));
test("全半角、英文大小写、空格与别名兼容", () => {
  const p = [productSchema.parse(real[0])];
  for (const q of ["  ＨＡＮＧＥ   ＺＯＥ  ", "ハンジ", "汉吉", "韩吉", "1123"])
    assert.equal(
      filterProducts(p, series, new URLSearchParams({ q })).length,
      q === "汉吉" ? 0 : 1,
    );
});
test("同组 OR、不同组 AND；任一发行匹配销售方式", () => {
  const params = new URLSearchParams("method=单售&method=盲抽&type=手办");
  assert.equal(filterProducts(products, series, params).length, 5);
  params.set("year", "unknown");
  assert.deepEqual(
    filterProducts(products, series, params).map((p) => p.id),
    ["demo-4"],
  );
});
test("未知年份在已知年份之后", () =>
  assert.equal(
    filterProducts(products, series, new URLSearchParams("sort=date")).at(-1)
      ?.id,
    "demo-4",
  ));
test("盲抽与整盒保留两个单位，特典不展示金额", () => {
  const p = priceText(products[1].releases[0]);
  assert.match(p, /单包/);
  assert.match(p, /整盒/);
  assert.equal(priceText(products[2].releases[0]), "购买特典，非单独销售");
});
test("未知价格不可为零；奖品不可伪装成单件原价", () => {
  assert.equal(priceText(products[5].releases[0]), "官方原价待核实");
  const r = structuredClone(products[6].releases[0]);
  r.prices[0].unit = "单个";
  assert.equal(releaseSchema.safeParse(r).success, false);
  const unknown = structuredClone(products[5].releases[0]);
  unknown.prices = [{ ...products[0].releases[0].prices[0], amount: 0 }];
  assert.equal(releaseSchema.safeParse(unknown).success, false);
});
test("再贩价格保留独立记录", () =>
  assert.deepEqual(
    products[3].releases.map((r) => r.prices[0].amount),
    [1000, 1500],
  ));
test("日期精度及实际日历日期有效", () => {
  assert.equal(
    dateSchema.safeParse({ value: "2024-01-01", precision: "year" }).success,
    false,
  );
  assert.equal(
    dateSchema.safeParse({ value: "2025-02-30", precision: "day" }).success,
    false,
  );
  assert.equal(
    dateSchema.safeParse({ value: "2025-02", precision: "month" }).success,
    true,
  );
});
test("无结果返回空列表", () =>
  assert.equal(
    filterProducts(products, series, new URLSearchParams("q=unfindable"))
      .length,
    0,
  ));
