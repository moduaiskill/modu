#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
제안서 HTML을 A4 PDF로 뽑고, 쪽 번호가 끊기지 않았는지 검사한다.

사용법
    python3 scripts/make_pdf.py 제안서.html            # 같은 이름의 .pdf 생성
    python3 scripts/make_pdf.py 제안서.html -o 제출본.pdf

왜 필요한가
    브라우저 인쇄로도 PDF가 나오지만, 쪽 번호는 앞표지·목차 장수와 본문 절의
    분량에 따라 어긋나기 쉽다. 제출 직전에 이 스크립트로 뽑아 번호를 기계로
    확인하면 "3쪽이 두 번 찍힌" 채로 제출하는 사고를 막을 수 있다.

검사 내용
    - 표지·목차 등 앞부분에 번호가 없는지
    - 본문 첫 쪽이 1인지
    - 이후 번호가 1씩 빠짐없이 증가하는지(중복·건너뜀 검출)

필요 패키지
    pip install weasyprint --break-system-packages
    (없으면 브라우저 인쇄 방법만 안내하고 종료한다)
"""

import argparse
import os
import re
import subprocess
import sys


def render(src, dst):
    try:
        from weasyprint import HTML
    except ImportError:
        sys.exit("weasyprint 가 없습니다.\n"
                 "  pip install weasyprint --break-system-packages\n"
                 "설치가 어려우면 브라우저에서 HTML을 열고 우측 상단 인쇄 버튼 → "
                 "대상을 'PDF로 저장'으로 두고 저장하세요.")
    HTML(filename=src).write_pdf(dst)


def page_numbers(pdf):
    """각 쪽 하단의 '- N -' 을 읽어 리스트로 돌려준다. 없으면 None."""
    out = []
    i = 1
    while True:
        r = subprocess.run(["pdftotext", "-layout", "-f", str(i), "-l", str(i), pdf, "-"],
                           capture_output=True)
        if r.returncode != 0:
            break
        text = r.stdout.decode("utf-8", "replace")
        # -layout 을 쓰면 쪽 번호가 마지막 줄로 온다. 본문 안의 "- 3 -" 같은
        # 문자열을 번호로 오인하지 않도록 마지막 몇 줄만 본다.
        lines = [ln for ln in text.splitlines() if ln.strip()]
        m = None
        for ln in lines[-3:]:
            hit = re.fullmatch(r"\s*-\s*(\d+)\s*-\s*", ln)
            if hit:
                m = int(hit.group(1))
        out.append(m)
        i += 1
        if i > 500:
            break
    return out


def check(nums):
    problems = []
    numbered = [(i, n) for i, n in enumerate(nums, start=1) if n is not None]
    if not numbered:
        problems.append("쪽 번호가 한 장도 찍히지 않았습니다.")
        return problems

    first_pdf_page, first_num = numbered[0]
    front = [n for i, n in enumerate(nums, start=1) if i < first_pdf_page and n is not None]
    if front:
        problems.append("표지·목차에 번호가 찍혔습니다.")
    if first_num != 1:
        problems.append(f"본문 첫 쪽이 {first_num} 입니다. 1이어야 합니다.")

    prev = None
    for pdf_page, n in numbered:
        if prev is not None and n != prev + 1:
            problems.append(f"PDF {pdf_page}쪽에서 번호가 {prev} → {n} 로 튑니다.")
        prev = n
    gap = [i for i, n in enumerate(nums, start=1) if i > first_pdf_page and n is None]
    if gap:
        problems.append(f"번호가 빠진 쪽: {gap}")
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("-o", "--out")
    args = ap.parse_args()

    dst = args.out or os.path.splitext(args.html)[0] + ".pdf"
    render(args.html, dst)

    nums = page_numbers(dst)
    total = len(nums)
    body = [n for n in nums if n is not None]
    print(f"생성 : {dst}  (총 {total}쪽, 번호 있는 쪽 {len(body)}장)")

    problems = check(nums)
    if problems:
        print("쪽 번호 점검 — 문제 발견")
        for p in problems:
            print("  ·", p)
        sys.exit(1)
    print(f"쪽 번호 점검 — 정상 (본문 1 ~ {body[-1]} 연속)")


if __name__ == "__main__":
    main()
