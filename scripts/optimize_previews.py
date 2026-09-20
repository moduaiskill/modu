"""tmp-previews/ 의 PNG와 예시 PDF를 assets/previews/ 용 WebP로 바꿉니다.

make_previews.js 로 PNG를 만든 뒤 실행합니다.
  python scripts/optimize_previews.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tmp-previews"
DEST = ROOT / "assets" / "previews"
MAX_WIDTH = 1600
QUALITY = 84


def save(image: Image.Image, name: str) -> None:
    if image.width > MAX_WIDTH:
        height = round(image.height * MAX_WIDTH / image.width)
        image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    target = DEST / name
    image.save(target, "WEBP", quality=QUALITY, method=6)
    print(f"{name:<24} {image.width}x{image.height}  {target.stat().st_size // 1024}KB")


def convert_pngs() -> None:
    for png in sorted(SRC.glob("*.png")):
        with Image.open(png) as image:
            save(image, png.stem + ".webp")


def convert_pdf(pdf_name: str, out_name: str, page: int = 0, zoom: float = 2.2) -> None:
    """견적서처럼 PDF만 있는 결과물은 첫 쪽을 이미지로 렌더링합니다."""
    import fitz

    path = ROOT / "examples" / pdf_name
    if not path.exists():
        print(f"건너뜀 — {pdf_name} 없음")
        return
    with fitz.open(path) as doc:
        pix = doc[page].get_pixmap(matrix=fitz.Matrix(zoom, zoom))
        image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    save(image, out_name)


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    convert_pngs()
    convert_pdf("06_견적서_샘플.pdf", "estimate-1.webp")


if __name__ == "__main__":
    main()
