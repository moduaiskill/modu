# -*- coding: utf-8 -*-
"""제안서·보고서 첨부용 사진 압축 스크립트.

원본 사진(수 MB~수십 MB)을 문서에 넣기 좋은 크기(긴 변 1400px, JPEG q78,
장당 약 150~250KB)로 압축한다. 확장자가 .png/.jpg여도 실제로는 HEIC인
아이폰 사진(파일 헤더 'ftypheic')을 자동으로 처리한다.

사용법:
    python compress_photos.py <원본폴더> <출력폴더> <접두어>

예:
    python compress_photos.py "./07 23" "./사진(보고서용)" day1
    → 사진(보고서용)/day1_01.jpg, day1_02.jpg, ...

파일명 끝의 숫자(_1, _2 …)를 기준으로 정렬하고, 숫자가 없으면 이름순.
EXIF 회전 정보를 반영해 사진이 눕지 않게 저장한다.

의존성: pillow, pillow-heif  (pip install pillow pillow-heif)
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    print("경고: pillow-heif가 없어 HEIC(아이폰) 사진은 열 수 없습니다."
          " 필요 시: pip install pillow-heif")

MAX_SIDE = 1400
QUALITY = 78
EXTS = {".png", ".jpg", ".jpeg", ".heic", ".heif", ".webp", ".bmp"}


def sort_key(p: Path):
    m = re.search(r"(\d+)$", p.stem)
    return (0, int(m.group(1))) if m else (1, p.stem)


def convert(src: Path, dst: Path):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)  # 회전 정보 반영
    im = im.convert("RGB")
    w, h = im.size
    scale = min(1.0, MAX_SIDE / max(w, h))
    if scale < 1.0:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=QUALITY, optimize=True)
    print(f"{src.name} -> {dst.name} ({im.size[0]}x{im.size[1]}, "
          f"{dst.stat().st_size // 1024}KB)")


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)
    src_dir, out_dir, prefix = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    out_dir.mkdir(parents=True, exist_ok=True)
    files = sorted((p for p in src_dir.iterdir()
                    if p.suffix.lower() in EXTS), key=sort_key)
    if not files:
        print(f"이미지 없음: {src_dir}")
        sys.exit(1)
    for i, p in enumerate(files, 1):
        convert(p, out_dir / f"{prefix}_{i:02d}.jpg")
    print(f"완료: {len(files)}장 -> {out_dir}")


if __name__ == "__main__":
    main()
