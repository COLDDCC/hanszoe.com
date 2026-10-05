import rawProducts from "../data/products.json";
import rawSeries from "../data/series.json";
import { productSchema, seriesSchema } from "./schema";
export const includeDemo = process.env.INCLUDE_DEMO === "true";
const demo = includeDemo ? (await import("../data/demo.json")).default : [];
export const products = [...rawProducts, ...demo]
  .map((p) => productSchema.parse(p))
  .filter((p) => includeDemo || !p.isDemo);
export const series = rawSeries
  .map((s) => seriesSchema.parse(s))
  .filter((s) => includeDemo || !s.isDemo);
