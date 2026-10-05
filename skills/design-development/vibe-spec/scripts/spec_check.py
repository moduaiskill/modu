#!/usr/bin/env python3
"""요구사항 마크다운에서 아직 안 채워진 칸을 찾는다.

    python3 spec_check.py requirements.md            # 남은 빈칸 목록
    python3 spec_check.py requirements.md --json     # 기계가 읽을 형태

빈칸으로 치는 것:
  ___ / ____ 같은 밑줄, {{ }}, TODO, 미정, 항목 뒤가 비어 있는 줄,
  그리고 제목만 있고 내용이 없는 절.

남은 칸이 있으면 종료 코드 1. 계획 시각화로 넘어가기 전에 이걸로 확인한다.
표준 라이브러리만 쓴다.
"""
import argparse, json, re, sys
from pathlib import Path

BLANK_MARKS = re.compile(r"(_{3,}|\{\{[^}]*\}\}|\bTODO\b|\bTBD\b|미정|아직\s*모름)", re.I)
COMMENT = re.compile(r"<!--.*?-->", re.S)


def analyze(text):
    """절(##) 단위로 훑으며 비어 있는 항목을 모은다."""
    body = COMMENT.sub("", text)          # 안내 주석은 내용으로 치지 않는다
    lines = body.split("\n")

    sections, current = [], {"title": "(머리말)", "line": 1, "blanks": [], "filled": 0}
    for n, raw in enumerate(lines, 1):
        line = raw.rstrip()
        if re.match(r"^#{1,3}\s+", line):
            sections.append(current)
            current = {"title": re.sub(r"^#+\s+", "", line), "line": n, "blanks": [], "filled": 0}
            continue
        if not line.strip():
            continue

        # "- 무엇을: ___" 또는 "- 무엇을:" 처럼 콜론 뒤가 빈 항목
        item = re.match(r"^\s*(?:[-*]|\d+\.)\s*(.*?)\s*:\s*(.*)$", line)
        if item:
            label, value = item.group(1), item.group(2).strip()
            if not value or BLANK_MARKS.fullmatch(value) or BLANK_MARKS.search(value):
                current["blanks"].append({"line": n, "label": label, "raw": line.strip()})
            else:
                current["filled"] += 1
            continue

        # 라벨 없이 값만 오는 줄
        if BLANK_MARKS.search(line):
            current["blanks"].append({"line": n, "label": current["title"], "raw": line.strip()})
        elif re.match(r"^\s*(?:[-*]|\d+\.)\s*$", line):
            current["blanks"].append({"line": n, "label": current["title"], "raw": "(빈 항목)"})
        else:
            current["filled"] += 1

    sections.append(current)

    empty_sections = [s["title"] for s in sections
                      if s["filled"] == 0 and not s["blanks"] and s["title"] != "(머리말)"]
    blanks = [b | {"section": s["title"]} for s in sections for b in s["blanks"]]
    total = sum(s["filled"] for s in sections) + len(blanks)
    return {
        "blanks": blanks,
        "empty_sections": empty_sections,
        "filled": total - len(blanks),
        "total": total,
        "ready": not blanks and not empty_sections,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    text = Path(args.path).read_text(encoding="utf-8")
    r = analyze(text)

    if args.json:
        print(json.dumps(r, ensure_ascii=False, indent=2))
    else:
        pct = round(r["filled"] / r["total"] * 100) if r["total"] else 0
        print(f"채운 칸 {r['filled']}/{r['total']} ({pct}%)")
        if r["blanks"]:
            print("\n아직 빈 칸:")
            for b in r["blanks"]:
                print(f"  {b['line']:>4}행  [{b['section']}] {b['label']}")
        if r["empty_sections"]:
            print("\n내용이 통째로 없는 절:")
            for s in r["empty_sections"]:
                print(f"  {s}")
        if r["ready"]:
            print("\n다 채웠습니다. 계획 시각화로 넘어가도 됩니다.")

    sys.exit(0 if r["ready"] else 1)


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        # head 나 less 로 넘겨 읽을 때 파이프가 먼저 닫히는 것은 오류가 아니다
        sys.stderr.close()
