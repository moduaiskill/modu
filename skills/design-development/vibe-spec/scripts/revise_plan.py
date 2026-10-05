#!/usr/bin/env python3
"""고친 계획을 다음 판으로 확정한다. 무엇이 바뀌었는지 스스로 찾아 적는다.

    python3 revise_plan.py 예전.json 고친.json --why "손님 전화번호를 받기로 함"
    python3 revise_plan.py 예전.json 고친.json --why "..." --out plan.json

고친.json 은 사람이(또는 클로드가) 판단해서 수정한 계획이다. 이 스크립트는 고치지 않는다.
두 파일을 견주어 바뀐 목록을 만들고, 판 번호와 함께 기록만 남긴다.
계획을 자동으로 고쳐 주는 도구가 아니다. 무엇을 어떻게 고칠지는 사람이 정한다.

표준 라이브러리만 쓴다.
"""
import argparse, json, sys
from datetime import date
from pathlib import Path

FIELD_NAMES = {
    "title": "제목", "goal": "목표", "phase": "출시 시점", "effort": "예상 소요",
    "tasks": "하는 일", "outputs": "생기는 것", "check": "확인할 것",
    "prompt": "AI에게 보낼 말", "reqs": "관련 요구사항", "risk": "주의",
}


def key_of(stage):
    return (stage.get("title") or "").strip()


def diff_stages(old, new):
    out = []
    o = {key_of(s): s for s in old}
    n = {key_of(s): s for s in new}

    for t in n:
        if t not in o:
            where = [i for i, s in enumerate(new, 1) if key_of(s) == t][0]
            out.append(f"{where}단계 '{t}' 추가")
    for t in o:
        if t not in n:
            out.append(f"단계 '{t}' 없앰")

    for t in n:
        if t not in o:
            continue
        for f, label in FIELD_NAMES.items():
            if f == "title":
                continue
            a, b = o[t].get(f), n[t].get(f)
            if a == b:
                continue
            if isinstance(a, list) or isinstance(b, list):
                a, b = a or [], b or []
                added = [x for x in b if x not in a]
                gone = [x for x in a if x not in b]
                for x in added:
                    out.append(f"'{t}' {label}에 추가: {x}")
                for x in gone:
                    out.append(f"'{t}' {label}에서 뺌: {x}")
            else:
                out.append(f"'{t}' {label} 바꿈")

    # 순서 변경
    common = [t for t in (key_of(s) for s in new) if t in o]
    before = [t for t in (key_of(s) for s in old) if t in n]
    if common != before and len(common) > 1:
        out.append("단계 순서 바꿈")
    return out


def diff_simple(old, new, label, key=None):
    out = []
    ov = {(x.get(key) if key else x): x for x in (old or [])}
    nv = {(x.get(key) if key else x): x for x in (new or [])}
    for k in nv:
        if k not in ov:
            name = nv[k].get("title") if isinstance(nv[k], dict) else k
            out.append(f"{label} 추가: {name}")
    for k in ov:
        if k not in nv:
            name = ov[k].get("title") if isinstance(ov[k], dict) else k
            out.append(f"{label} 뺌: {name}")
    for k in nv:
        if k in ov and isinstance(nv[k], dict) and ov[k] != nv[k]:
            out.append(f"{label} 내용 바꿈: {nv[k].get('title', k)}")
    return out


def warn_scope(old, new):
    """범위가 늘어나고 있으면 알려 준다. 비전공자 프로젝트가 무너지는 첫 신호다."""
    out = []
    mvp = lambda p: [s for s in p.get("stages", []) if s.get("phase") != "later"]
    a, b = len(mvp(old)), len(mvp(new))
    if b > a:
        out.append(f"1차 출시 단계가 {a}개에서 {b}개로 늘었습니다. 늘어난 만큼 뒤로 미룰 것을 정했는지 확인하세요.")
    if len(new.get("requirements", [])) > len(old.get("requirements", [])):
        out.append("필수 요구사항이 늘었습니다. 1차에 정말 필요한지 다시 물어보세요.")
    if len(new.get("notMaking", [])) < len(old.get("notMaking", [])):
        out.append("'만들지 않을 것'이 줄었습니다. 범위를 푼 이유가 분명한지 확인하세요.")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("old", help="지난 판 plan.json")
    ap.add_argument("new", help="고친 plan.json")
    ap.add_argument("--why", required=True, help="이번에 고친 이유 한 줄")
    ap.add_argument("--out", help="결과 저장 경로 (기본값: 고친 파일에 덮어씀)")
    ap.add_argument("--date", default=date.today().isoformat())
    args = ap.parse_args()

    old = json.loads(Path(args.old).read_text(encoding="utf-8"))
    new = json.loads(Path(args.new).read_text(encoding="utf-8"))

    changes = (diff_stages(old.get("stages", []), new.get("stages", []))
               + diff_simple(old.get("requirements"), new.get("requirements"), "요구사항", key="id")
               + diff_simple(old.get("notMaking"), new.get("notMaking"), "만들지 않을 것")
               + diff_simple(old.get("openQuestions"), new.get("openQuestions"), "정하지 못한 것"))

    if not changes:
        sys.exit("바뀐 것이 없습니다. 고친 파일이 맞는지 확인하세요.")

    version = (old.get("version") or 1) + 1
    new["version"] = version
    new.setdefault("revisions", list(old.get("revisions", [])))
    new["revisions"].append({"n": version, "date": args.date, "why": args.why, "changes": changes})

    out = Path(args.out or args.new)
    out.write_text(json.dumps(new, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"판 {version} 로 기록했습니다: {out}")
    for c in changes:
        print(f"  - {c}")
    for w in warn_scope(old, new):
        print(f"  살펴볼 것: {w}")
    print("\n이제 build_plan.py 로 다시 그리면 됩니다.")


if __name__ == "__main__":
    main()
