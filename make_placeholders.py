#!/usr/bin/env python3
"""Generate placeholder thumbnail images for dramas."""
import os

try:
    from PIL import Image, ImageDraw, ImageFont
    USE_PIL = True
except ImportError:
    USE_PIL = False

os.makedirs("assets/img", exist_ok=True)

dramas = [
    ("humrahi", "Humrahi\nرفيق الطريق"),
    ("rangde",  "Rang De\nلونني"),
]

if USE_PIL:
    for slug, label in dramas:
        img = Image.new("RGB", (640, 336), color=(30, 10, 20))
        draw = ImageDraw.Draw(img)
        # Pink gradient rectangle
        for y in range(336):
            r = int(30 + (y/336)*80)
            draw.line([(0, y), (640, y)], fill=(r, 10, 30))
        draw.text((320, 160), label, fill=(255, 255, 255), anchor="mm")
        path = f"assets/img/{slug}.webp"
        img.save(path, "WEBP")
        print(f"Created {path}")
else:
    # Fallback: create tiny SVGs renamed as placeholders
    for slug, label in dramas:
        path = f"assets/img/{slug}.svg"
        svg = f"""<svg xmlns='http://www.w3.org/2000/svg' width='640' height='336'>
  <rect width='640' height='336' fill='#1a0a10'/>
  <text x='320' y='168' font-family='Arial' font-size='28' fill='white' text-anchor='middle'>{label}</text>
</svg>"""
        with open(path, "w") as f:
            f.write(svg)
        print(f"Created placeholder {path}")

print("Done! Replace these with your real drama thumbnails (.webp or .jpg)")
