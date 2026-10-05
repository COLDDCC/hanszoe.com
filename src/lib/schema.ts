import { z } from "zod";
export const dateSchema = z
  .object({ value: z.string(), precision: z.enum(["year", "month", "day"]) })
  .superRefine((d, c) => {
    const p = {
      year: /^\d{4}$/,
      month: /^\d{4}-(0[1-9]|1[0-2])$/,
      day: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    };
    if (!p[d.precision].test(d.value))
      c.addIssue({ code: "custom", message: "日期格式与精度不一致" });
    if (
      d.precision === "day" &&
      new Date(d.value + "T00:00:00Z").toISOString().slice(0, 10) !== d.value
    )
      c.addIssue({ code: "custom", message: "无效日期" });
  });
export const sourceSchema = z.object({
  id: z.string().min(1),
  url: z.url().refine((u) => u.startsWith("https://")),
  title: z.string().min(1),
  organization: z.string().min(1),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fields: z.array(z.string()).min(1),
});
const imageSchema = z.object({
  path: z.string().startsWith("/"),
  alt: z.string().min(1),
  sourceUrl: z.url(),
  credit: z.string(),
  usage: z.string().min(1),
});
export const types = [
  "徽章",
  "亚克力",
  "纸品",
  "玩偶",
  "手办",
  "服饰",
  "生活用品",
  "其他",
] as const;
export const methods = [
  "单售",
  "盲抽",
  "整盒",
  "购买特典",
  "抽奖奖品",
  "其他",
] as const;
export const priceSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.enum(["JPY", "CNY", "USD", "HKD", "KRW"]),
  taxStatus: z.enum(["含税", "不含税", "未注明"]),
  unit: z.enum(["单个", "单包", "整盒", "套装", "每抽"]),
  quantity: z.number().int().positive().nullable(),
  sourceId: z.string(),
});
export const releaseSchema = z
  .object({
    releaseId: z.string().min(1),
    kind: z.enum(["初版", "再贩"]),
    region: z.string(),
    sourceIds: z.array(z.string()).min(1),
    announcement: dateSchema.nullable(),
    preorderStart: dateSchema.nullable(),
    preorderEnd: dateSchema.nullable(),
    releaseDate: dateSchema.nullable(),
    salesMethod: z.enum(methods),
    limitedScope: z.string().nullable(),
    limitedSourceId: z.string().nullable(),
    priceStatus: z.enum(["known", "unknown", "notSoldSeparately"]),
    prices: z.array(priceSchema),
    condition: z.string().nullable(),
    conditionSourceId: z.string().nullable(),
  })
  .superRefine((v, c) => {
    const issue = (message: string) => c.addIssue({ code: "custom", message });
    if ((v.priceStatus === "known") !== v.prices.length > 0)
      issue("known 必须包含价格，未知或非单售不得包含售价");
    if (v.salesMethod === "购买特典" && v.priceStatus !== "notSoldSeparately")
      issue("特典必须标记非单独销售");
    if (v.salesMethod === "抽奖奖品" && v.prices.some((p) => p.unit !== "每抽"))
      issue("奖品只能记录每抽价格");
    if (v.limitedScope && !v.limitedSourceId) issue("限定范围必须有来源");
    if (v.condition && !v.conditionSourceId) issue("获取条件必须有来源");
  });
export const productSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    names: z
      .object({ zh: z.string(), ja: z.string(), en: z.string() })
      .refine((v) => Object.values(v).some(Boolean)),
    aliases: z.array(z.string()),
    type: z.enum(types),
    manufacturer: z.string().nullable(),
    publisher: z.string().nullable(),
    seriesId: z.string(),
    region: z.string(),
    images: z.array(imageSchema),
    description: z.string(),
    specifications: z.record(z.string(), z.string()),
    releases: z.array(releaseSchema).min(1),
    relatedProductIds: z.array(z.string()),
    evidenceStatus: z.enum(["verified", "partial"]),
    missingFields: z.array(z.string()),
    sources: z.array(sourceSchema).min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    isDemo: z.boolean(),
  })
  .superRefine((v, c) => {
    if (v.evidenceStatus === "partial" && !v.missingFields.length)
      c.addIssue({ code: "custom", message: "partial 必须说明缺项" });
    const ids = v.sources.map((s) => s.id);
    for (const x of v.releases)
      for (const id of [
        ...x.sourceIds,
        ...x.prices.map((p) => p.sourceId),
        x.limitedSourceId,
        x.conditionSourceId,
      ].filter(Boolean))
        if (!ids.includes(id!))
          c.addIssue({ code: "custom", message: "发行引用未知来源 " + id });
    if (new Set(v.releases.map((x) => x.releaseId)).size !== v.releases.length)
      c.addIssue({ code: "custom", message: "重复发行 ID" });
  });
export const seriesSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  aliases: z.array(z.string()),
  description: z.string(),
  region: z.string(),
  type: z.string(),
  sources: z.array(sourceSchema).min(1),
  updatedAt: z.string(),
  isDemo: z.boolean(),
  images: z.array(imageSchema),
});
export type Product = z.infer<typeof productSchema>;
export type Series = z.infer<typeof seriesSchema>;
export type Release = z.infer<typeof releaseSchema>;
