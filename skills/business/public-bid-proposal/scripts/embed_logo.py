#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
표지 로고를 제안서 HTML 안에 data URI로 심는다.

제안서는 메일로 오가는 문서라 이미지 링크가 끊기면 표지가 깨진다.
로고는 별도 파일로 두지 말고 HTML 안에 박아 넣어 파일 하나로 완결시킨다.

사용법
    python3 scripts/embed_logo.py 제안서.html --logo 기관로고.png

동작
- HTML 안의 LOGO_PLACEHOLDER 문자열을 data:image/png;base64,… 로 치환한다.
- 이미 치환된 파일에 다시 실행해도 안전하다(치환할 것이 없으면 그냥 알린다).
- 로고 파일이 없으면 템플릿 표지의 <img class="logo"> 줄을 지우고 기관명만 둔다.
"""

import argparse
import base64
import mimetypes
import os
import sys

PLACEHOLDER = "LOGO_PLACEHOLDER"
# 기관 로고를 assets/logo.png 로 두면 --logo 없이도 잡힌다.
DEFAULT_LOGO = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            "..", "assets", "logo.png")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html", help="제안서 HTML 경로")
    ap.add_argument("--logo", default=DEFAULT_LOGO,
                    help="로고 이미지 경로 (png/svg). 기본값: assets/logo.png")
    args = ap.parse_args()

    if not os.path.exists(args.logo):
        sys.exit(f"로고 파일을 찾을 수 없습니다: {args.logo}\n"
                 "  --logo 로 기관 로고 경로를 지정하거나, assets/logo.png 로 두세요.\n"
                 "  로고가 없으면 표지의 <img class=\"logo\"> 줄을 지우고 기관명만 두면 됩니다.")

    mime = mimetypes.guess_type(args.logo)[0] or "image/png"
    with open(args.logo, "rb") as f:
        uri = f"data:{mime};base64," + base64.b64encode(f.read()).decode()

    with open(args.html, encoding="utf-8") as f:
        html = f.read()

    if PLACEHOLDER not in html:
        print(f"'{PLACEHOLDER}' 가 없습니다. 이미 로고가 삽입된 파일로 보입니다.")
        return

    n = html.count(PLACEHOLDER)
    with open(args.html, "w", encoding="utf-8") as f:
        f.write(html.replace(PLACEHOLDER, uri))
    print(f"로고 삽입 완료 ({n}곳) : {args.logo} → {args.html}")


if __name__ == "__main__":
    main()
