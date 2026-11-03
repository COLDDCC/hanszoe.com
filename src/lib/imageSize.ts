import { openSync, readSync, closeSync } from "node:fs";
import { join } from "node:path";

// 构建时读取 public/ 下 WebP 图片的真实宽高，给没有登记尺寸的资讯封面写入 width/height，避免布局跳动（CLS）。
// 只解析文件头（前 30 字节）；不是 WebP 或读取失败时返回 null，页面照常输出、只是不带尺寸。
export function webpSize(publicPath: string): { width: number; height: number } | null {
  let fd: number | undefined;
  try {
    fd = openSync(join(process.cwd(), "public", publicPath), "r");
    const b = Buffer.alloc(30);
    if (readSync(fd, b, 0, 30, 0) < 30) return null;
    if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}
