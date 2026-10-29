#!/usr/bin/env python3
"""把商品图与资讯图从「SVG 包 base64 位图」转换为 WebP。

过去 public/images/products 与 public/images/news 下的 .svg 文件，每个都只是一张
base64 编码的 JPEG/PNG 套了 SVG 外壳：体积比原图大约三分之一，浏览器不能按屏幕
选尺寸，也不能用作社交分享图。本脚本：

1. 从每个 SVG 中解出原始位图（保留 ICC 色彩配置与透明通道）；
2. 生成完整图 <name>.webp（最长边不超过 1000px）；
3. 商品图另生成卡片缩略图 <name>-480.webp（最长边不超过 480px）；
4. 改写 src/data/products.json 与 src/data/series.json 的 images：path 指向新图，
   并写入 width、height、thumbPath；改写资讯 Markdown 中的 cover 路径；
5. 删除已转换的 SVG。

可重复运行：没有待转换的 SVG 时不做任何修改。新增图片时，直接放 .jpg/.png
到 public/images/products/ 后运行本脚本也会生成 WebP 与缩略图并改写引用。

依赖：Python 3.10+ 与 Pillow（含 WebP 支持）。
用法：python3 scripts/convert-images.py [--dry-run]
"""
from __future__ import annotations

import base64
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
DIRS = {"products": PUBLIC / "images" / "products", "news": PUBLIC / "images" / "news"}
FULL_MAX = 1000
THUMB_MAX = 480
QUALITY = 80
DATA_FILES = [ROOT / "src" / "data" / "products.json", ROOT / "src" / "data" / "series.json"]
NEWS_DIR = ROOT / "src" / "content" / "news"
SVG_IMAGE = re.compile(r'href="data:image/(jpeg|png|webp|gif);base64,([^"]+)"')


def extract(svg: Path) -> Image.Image:
    images = SVG_IMAGE.findall(svg.read_text(encoding="utf-8"))
    if len(images) != 1:
        raise SystemExit(f"{svg}: 预期恰好一张内嵌位图，实际 {len(images)} 张，请手动处理")
    return Image.open(io.BytesIO(base64.b64decode(images[0][1])))


def save_webp(img: Image.Image, longest: int, out: Path, icc: bytes | None) -> tuple[int, int]:
    im = img.copy()
    im.thumbnail((longest, longest), Image.Resampling.LANCZOS)
    kwargs = {"quality": QUALITY, "method": 6}
    if icc:
        kwargs["icc_profile"] = icc
    im.save(out, "WEBP", **kwargs)
    return im.size


def normalize_mode(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
    if has_alpha:
        return img.convert("RGBA")
    if img.mode == "CMYK":
        return img.convert("RGB")
    return img if img.mode == "RGB" else img.convert("RGB")


def convert(src: Path, kind: str, dry: bool) -> dict:
    img = extract(src) if src.suffix == ".svg" else Image.open(src)
    icc = img.info.get("icc_profile")
    img = normalize_mode(img)
    full = src.with_suffix(".webp")
    info = {"path": "/" + full.relative_to(PUBLIC).as_posix()}
    if dry:
        return info
    w, h = save_webp(img, FULL_MAX, full, icc)
    info.update(width=w, height=h)
    if kind == "products":
        thumb = src.with_name(src.stem + f"-{THUMB_MAX}.webp")
        save_webp(img, THUMB_MAX, thumb, icc)
        info["thumbPath"] = "/" + thumb.relative_to(PUBLIC).as_posix()
    return info


def main() -> None:
    dry = "--dry-run" in sys.argv
    mapping: dict[str, dict] = {}
    before = after = 0
    for kind, folder in DIRS.items():
        sources = sorted(folder.glob("*.svg"))
        if kind == "products":
            # 手动新增的 jpg/png（分享卡片专用的 -og.jpg 除外）
            sources += sorted(
                p
                for p in folder.iterdir()
                if p.suffix.lower() in (".jpg", ".jpeg", ".png") and not p.stem.endswith("-og")
            )
        for src in sources:
            old = "/" + src.relative_to(PUBLIC).as_posix()
            before += src.stat().st_size
            info = convert(src, kind, dry)
            mapping[old] = info
            if not dry:
                after += sum(
                    (PUBLIC / v.lstrip("/")).stat().st_size
                    for k, v in info.items()
                    if k in ("path", "thumbPath")
                )
    if not mapping:
        print("没有待转换的图片。")
        return

    changed_refs = 0
    for data_file in DATA_FILES:
        records = json.loads(data_file.read_text(encoding="utf-8"))
        touched = False
        for record in records:
            for image in record.get("images", []):
                info = mapping.get(image["path"])
                if not info:
                    continue
                # 保持字段顺序：path 后紧跟 thumbPath、width、height
                rebuilt = {"path": info["path"]}
                for key in ("thumbPath", "width", "height"):
                    if key in info:
                        rebuilt[key] = info[key]
                rebuilt.update({k: v for k, v in image.items() if k not in rebuilt and k not in ("thumbPath", "width", "height")})
                image.clear()
                image.update(rebuilt)
                touched = True
                changed_refs += 1
        if touched and not dry:
            data_file.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for md in sorted(NEWS_DIR.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        new = text
        for old, info in mapping.items():
            if old.startswith("/images/news/"):
                new = new.replace(old, info["path"])
        if new != text:
            changed_refs += 1
            if not dry:
                md.write_text(new, encoding="utf-8")

    if not dry:
        for old in mapping:
            src = PUBLIC / old.lstrip("/")
            if src.suffix == ".svg" or src.suffix.lower() in (".jpg", ".jpeg", ".png"):
                src.unlink()

    print(f"转换 {len(mapping)} 张图片，改写 {changed_refs} 处引用。")
    if not dry:
        print(f"体积 {before / 1e6:.1f} MB → {after / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
