import type { Product } from "./schema";

type Img = Product["images"][number];

/** scripts/convert-images.py 生成缩略图时使用的最长边 */
const THUMB_MAX = 480;

/** 卡片上的图片地址：有缩略图用缩略图，否则用原图 */
export const cardSrc = (img: Img) => img.thumbPath || img.path;

/** 卡片 srcset：缩略图与完整图两档，由浏览器按屏幕宽度与像素密度选择 */
export const cardSrcset = (img: Img) => {
  if (!img.thumbPath || !img.width || !img.height) return undefined;
  const scale = Math.min(1, THUMB_MAX / Math.max(img.width, img.height));
  const thumbWidth = Math.round(img.width * scale);
  if (thumbWidth >= img.width) return undefined;
  return `${img.thumbPath} ${thumbWidth}w, ${img.path} ${img.width}w`;
};

/** 与 .product-grid 的列宽对应：≤340px 单列，≤1000px 两列，桌面三列（约 360px） */
export const cardSizes =
  "(max-width: 340px) 100vw, (max-width: 1000px) 50vw, 360px";
