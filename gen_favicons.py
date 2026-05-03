"""Generate favicon-256.png and favicon.ico from the amber 'D5' design."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / "public"
OUT.mkdir(exist_ok=True)

SIZE = 256
BG = "#f59e0b"
FG = "#ffffff"
RADIUS = int(SIZE * 14 / 64)


def make(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * 14 / 64)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=r, fill=BG)
    # Try a system font; fall back to default.
    font = None
    for name in ("seguibl.ttf", "segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"):
        try:
            font = ImageFont.truetype(name, int(size * 0.7))
            break
        except OSError:
            continue
    if font is None:
        font = ImageFont.load_default()
    text = "5"
    bbox = d.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]
    d.text((x, y), text, fill=FG, font=font)
    return img


def main() -> None:
    img = make(SIZE)
    img.save(OUT / "favicon-256.png", format="PNG")
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(OUT / "favicon.ico", format="ICO", sizes=sizes)
    print(f"Wrote {OUT/'favicon-256.png'} and {OUT/'favicon.ico'}")


if __name__ == "__main__":
    main()
