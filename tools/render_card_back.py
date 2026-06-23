#!/usr/bin/env python3
"""Render the Pi Tarot card back using the fixed front-card template overlay."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets" / "cards"
BACK_DIR = BASE / "back"
OUTPUT_DIR = BASE / "output"
PREVIEW_DIR = BASE / "previews"
TEMPLATE_DIR = BASE / "template"

W, H = 1024, 1536
BASE_SOURCE = BACK_DIR / "card-back-base-imagegen.png"
OVERLAY_SOURCE = TEMPLATE_DIR / "card-template-overlay.png"
WEBP_OUT_PATH = OUTPUT_DIR / "card-back.webp"
PREVIEW_PATH = PREVIEW_DIR / "card-back-preview.png"
COMPARISON_PATH = PREVIEW_DIR / "card-back-front-comparison.png"

COLORS = {
    "deep_purple": "#2B164F",
    "purple": "#4A247A",
    "violet": "#7F58C8",
    "gold": "#F6B541",
    "gold_light": "#FFE7A3",
    "gold_dark": "#A85F18",
    "cream": "#FFF4D6",
}


def hex_to_rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    h = hex_color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), alpha


def fit_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    img = img.convert("RGBA")
    scale = max(size[0] / img.width, size[1] / img.height)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def rounded_rect(
    draw: ImageDraw.ImageDraw,
    rect: tuple[int, int, int, int],
    radius: int,
    fill: str,
) -> None:
    draw.rounded_rectangle(rect, radius=radius, fill=fill)


def draw_pi_glyph(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float, fill: str) -> None:
    """Draw a Pi Network-like glyph with square dots and a non-bulbous right hook."""
    s = scale
    dot = round(20 * s)
    top_y = round(cy - 50 * s)
    top_h = round(31 * s)
    top_left = round(cx - 95 * s)
    top_right = round(cx + 68 * s)
    stem_w = round(31 * s)
    stem_top = round(cy - 24 * s)
    stem_bottom = round(cy + 106 * s)

    rounded_rect(draw, (top_left, top_y, top_right, top_y + top_h), round(7 * s), fill)
    rounded_rect(draw, (round(cx - 58 * s), stem_top, round(cx - 58 * s) + stem_w, stem_bottom), round(7 * s), fill)
    rounded_rect(draw, (round(cx + 15 * s), stem_top, round(cx + 15 * s) + stem_w, stem_bottom), round(7 * s), fill)

    # Squared upward hook at the far-right end, matching the saved Pi reference.
    hook = [
        (round(cx + 54 * s), round(cy - 50 * s)),
        (round(cx + 93 * s), round(cy - 50 * s)),
        (round(cx + 93 * s), round(cy - 78 * s)),
        (round(cx + 118 * s), round(cy - 78 * s)),
        (round(cx + 118 * s), round(cy - 20 * s)),
        (round(cx + 68 * s), round(cy - 20 * s)),
    ]
    draw.polygon(hook, fill=fill)
    rounded_rect(draw, (round(cx - 55 * s), round(cy - 102 * s), round(cx - 55 * s) + dot, round(cy - 102 * s) + dot), round(4 * s), fill)
    rounded_rect(draw, (round(cx + 18 * s), round(cy - 102 * s), round(cx + 18 * s) + dot, round(cy - 102 * s) + dot), round(4 * s), fill)


def draw_medallion(base: Image.Image) -> None:
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = W // 2, H // 2
    for radius, alpha in ((230, 34), (192, 52), (155, 68)):
        gd.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=hex_to_rgba(COLORS["gold"], alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(24))
    base.alpha_composite(glow)

    draw = ImageDraw.Draw(base)
    cx, cy = W // 2, H // 2
    draw.ellipse((cx - 160, cy - 160, cx + 160, cy + 160), fill=hex_to_rgba(COLORS["gold_dark"]))
    draw.ellipse((cx - 150, cy - 150, cx + 150, cy + 150), fill=hex_to_rgba(COLORS["gold"]))
    draw.ellipse((cx - 130, cy - 130, cx + 130, cy + 130), fill=hex_to_rgba(COLORS["gold_light"]))
    draw.ellipse((cx - 108, cy - 108, cx + 108, cy + 108), fill=hex_to_rgba(COLORS["deep_purple"]))
    draw.ellipse((cx - 94, cy - 94, cx + 94, cy + 94), outline=hex_to_rgba(COLORS["gold_light"]), width=4)

    for r in (122, 144):
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=hex_to_rgba(COLORS["cream"], 210), width=3)

    draw_pi_glyph(draw, cx, cy + 10, 0.78, COLORS["gold_light"])

    for x, y in ((cx, cy - 218), (cx, cy + 218), (cx - 218, cy), (cx + 218, cy)):
        draw.polygon([(x, y - 20), (x + 9, y), (x, y + 20), (x - 9, y)], fill=hex_to_rgba(COLORS["gold_light"], 230))
        draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=hex_to_rgba(COLORS["purple"], 240))


def prepare_back_overlay(overlay: Image.Image) -> Image.Image:
    """Keep the front-card frame but remove the blank nameplate fill from the back."""
    overlay = overlay.convert("RGBA")
    px = overlay.load()
    # The front template's cream nameplate reads as an empty title box on the card back.
    # Remove only the pale fill region; keep gold outlines and bottom ornaments.
    for y in range(1204, 1408):
        for x in range(108, 916):
            r, g, b, a = px[x, y]
            if a and r > 215 and g > 175 and b > 120:
                px[x, y] = (r, g, b, 0)
    return overlay


def render_back() -> Image.Image:
    if not BASE_SOURCE.exists():
        raise FileNotFoundError(f"Missing card back base: {BASE_SOURCE}")
    if not OVERLAY_SOURCE.exists():
        raise FileNotFoundError(f"Missing template overlay: {OVERLAY_SOURCE}")

    base = fit_cover(Image.open(BASE_SOURCE), (W, H))
    draw_medallion(base)
    overlay = Image.open(OVERLAY_SOURCE).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    overlay = prepare_back_overlay(overlay)
    base.alpha_composite(overlay)
    return base


def transparentize_edge_black(img: Image.Image, threshold: int = 24) -> Image.Image:
    """Make only edge-connected near-black pixels transparent."""
    img = img.convert("RGBA")
    px = img.load()
    stack: list[tuple[int, int]] = []
    seen: set[tuple[int, int]] = set()

    for x in range(img.width):
        stack.append((x, 0))
        stack.append((x, img.height - 1))
    for y in range(img.height):
        stack.append((0, y))
        stack.append((img.width - 1, y))

    while stack:
        x, y = stack.pop()
        if (x, y) in seen or x < 0 or y < 0 or x >= img.width or y >= img.height:
            continue
        seen.add((x, y))
        r, g, b, a = px[x, y]
        if a == 0 or max(r, g, b) > threshold:
            continue
        px[x, y] = (r, g, b, 0)
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return img


def write_comparison(back: Image.Image) -> None:
    sample_front = OUTPUT_DIR / "text-webp" / "00_major_00_the-fool.webp"
    if not sample_front.exists():
        return
    with Image.open(sample_front) as front:
        thumb_w, thumb_h = 256, 384
        pad = 24
        sheet = Image.new("RGB", (pad * 3 + thumb_w * 2, pad * 2 + thumb_h), "#EFE7FF")
        sheet.paste(front.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (pad, pad))
        sheet.paste(back.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (pad * 2 + thumb_w, pad))
        sheet.save(COMPARISON_PATH, quality=95)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    rendered = transparentize_edge_black(render_back())
    rendered.save(WEBP_OUT_PATH, "WEBP", quality=82, method=6, lossless=False, exact=True)
    rendered.save(PREVIEW_PATH, optimize=True)
    write_comparison(rendered)
    print(f"card back webp: {WEBP_OUT_PATH}")
    print(f"preview: {PREVIEW_PATH}")
    print(f"comparison: {COMPARISON_PATH}")


if __name__ == "__main__":
    main()
