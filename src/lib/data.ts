import rawProducts from "../data/products.json";
import rawSeries from "../data/series.json";
import rawCanonNotes from "../data/canonNotes.json";
import { canonNoteSchema, productSchema, seriesSchema } from "./schema";
export const includeDemo = process.env.INCLUDE_DEMO === "true";
const demo = includeDemo ? (await import("../data/demo.json")).default : [];
const demoNotes = includeDemo
  ? (await import("../data/canonNotesDemo.json")).default
  : [];
export const products = [...rawProducts, ...demo]
  .map((p) => productSchema.parse(p))
  .filter((p) => includeDemo || !p.isDemo);
export const series = rawSeries
  .map((s) => seriesSchema.parse(s))
  .filter((s) => includeDemo || !s.isDemo);
export const canonNotes = [...rawCanonNotes, ...demoNotes]
  .map((n) => canonNoteSchema.parse(n))
  .filter((n) => includeDemo || !n.isDemo);
