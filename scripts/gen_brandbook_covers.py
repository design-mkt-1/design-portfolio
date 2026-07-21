#!/usr/bin/env python3
"""Render the first page of each brand book PDF to a WebP cover thumbnail.

One-time / on-demand helper (not part of the CI build). The output WebP files
are committed and referenced from src/data/projects.ts as the Brand Book
choice-card preview. Re-run whenever a brand book PDF is replaced.
"""
import io
import pathlib

import fitz  # pymupdf
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / "public" / "assets"

# Target thumbnail width (px). Rendered at 2x for retina, then saved.
TARGET_W = 640


def render_cover(pdf_path: pathlib.Path, out_path: pathlib.Path) -> None:
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    # scale so the rendered width ~= TARGET_W
    zoom = TARGET_W / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "WEBP", quality=82, method=6)
    doc.close()
    print(f"  {pdf_path.relative_to(ROOT)} -> {out_path.relative_to(ROOT)} ({img.width}x{img.height})")


def main() -> None:
    print("Rendering brand book covers:")
    for pdf in sorted(ASSETS.glob("*/brandbook/*.pdf")):
        out = pdf.parent / "cover.webp"
        render_cover(pdf, out)
    print("done.")


if __name__ == "__main__":
    main()
