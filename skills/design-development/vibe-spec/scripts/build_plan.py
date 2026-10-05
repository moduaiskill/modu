#!/usr/bin/env python3
"""plan.json -> plan.html (만들기 전에 보는 계획 지도)

    python3 build_plan.py plan.json --out ./out
    python3 build_plan.py plan.json --out ./out --spec requirements.md

--spec 을 주면 요구사항 마크다운이 페이지 안에 담겨, 보는 사람이 버튼으로 내려받을 수 있다.
표준 라이브러리만 쓴다.
"""
import argparse, base64, json, re, sys
from pathlib import Path

TEMPLATE = Path(__file__).resolve().parent.parent / "assets" / "plan-template.html"

SECRET_PATTERNS = [
    (re.compile(r"sk-ant-[A-Za-z0-9_\-]{8,}"), "sk-ant-***"),
    (re.compile(r"sk-[A-Za-z0-9]{20,}"), "sk-***"),
    (re.compile(r"gh[pousr]_[A-Za-z0-9]{16,}"), "ghp_***"),
    (re.compile(r"AKIA[0-9A-Z]{12,}"), "AKIA***"),
    (re.compile(r"AIza[0-9A-Za-z_\-]{20,}"), "AIza***"),
]


def scrub(v):
    if isinstance(v, str):
        for pat, mask in SECRET_PATTERNS:
            v = pat.sub(mask, v)
        return v
    if isinstance(v, list):
        return [scrub(x) for x in v]
    if isinstance(v, dict):
        return {k: scrub(x) for k, x in v.items()}
    return v


DEFAULT_ABOUT_ME = (
    "저는 개발을 잘 모릅니다. 다음을 지켜 주세요.\n"
    "- 전문용어를 쓸 때는 한 줄로 풀어서 같이 설명해 주세요.\n"
    "- 제가 해야 할 일은 한 번에 하나씩, 순서대로 알려 주세요.\n"
    "- 파일을 어디에 만들고 어떻게 열어 보는지도 알려 주세요.\n"
    "- 제가 확인해 봐야 눈에 보이는 결과부터 만들어 주세요."
)


def file_slug(n, title):
    safe = re.sub(r"[^\w\-]+", "-", (title or "단계").strip(), flags=re.UNICODE).strip("-_")
    return f"{n:02d}-{safe or 'stage'}.md"


def bullets(items, prefix="- "):
    return "\n".join(f"{prefix}{x}" for x in (items or []))


def render_brief(data, idx):
    """한 단계를 그대로 AI에 올릴 수 있는 파일로 만든다. 형식은 모든 단계가 같다."""
    stages = data["stages"]
    s = stages[idx]
    p = data.get("project", {})
    n = idx + 1
    L = [f"# {n}단계 — {s.get('title', '단계')}"]
    L.append("")
    L.append("> 이 파일을 클로드에 올린 뒤 \"이 파일대로 시작해 줘\"라고 말하세요.")
    L.append("> 다른 설명을 덧붙이지 않아도 됩니다.")

    L.append("\n## 무엇을 만드는 중인가\n")
    L.append(f"- 만드는 것: {p.get('oneLiner') or p.get('title', '')}")
    if p.get("who"):
        L.append(f"- 쓸 사람: {p['who']}")
    if p.get("where"):
        L.append(f"- 올릴 곳: {p['where']}")

    L.append("\n## 지금까지 된 것\n")
    if idx == 0:
        L.append("아직 아무것도 만들지 않았습니다. 빈 상태에서 시작합니다.")
    else:
        for k in range(idx):
            done = stages[k]
            L.append(f"- {k + 1}단계 {done.get('title', '')}: {done.get('goal', '')}".rstrip(": "))
        L.append("\n이 결과물 위에 이어서 만들어 주세요. 처음부터 다시 만들지 마세요.")

    L.append("\n## 이번 단계에서 할 일\n")
    if s.get("goal"):
        L.append(s["goal"] + "\n")
    if s.get("tasks"):
        L.append(bullets(s["tasks"]))

    ask = s.get("ask") or s.get("prompt")
    if ask:
        L.append("\n## 부탁하는 것\n")
        L.append(ask)

    if s.get("outputs"):
        L.append("\n## 끝나면 이런 것이 있어야 합니다\n")
        L.append(bullets(s["outputs"]))

    if s.get("check"):
        L.append("\n## 제가 직접 확인할 것\n")
        L.append("이 항목들을 제가 눈으로 확인할 수 있게 만들어 주세요.\n")
        L.append(bullets(s["check"], "- [ ] "))

    limits = list(data.get("notMaking") or [])
    if limits or s.get("risk"):
        L.append("\n## 지키기로 한 것\n")
        if limits:
            L.append("이번 프로젝트에서 만들지 않기로 한 것입니다. 먼저 물어보지 않고 넣지 마세요.\n")
            L.append(bullets(limits))
        if s.get("risk"):
            L.append(f"\n주의: {s['risk']}")

    L.append("\n## 저에 대해\n")
    L.append(p.get("aboutMe") or DEFAULT_ABOUT_ME)

    L.append("\n## 이번 단계의 범위\n")
    nxt = stages[idx + 1] if idx + 1 < len(stages) else None
    if nxt:
        L.append(f"이 단계를 벗어나는 일은 지금 하지 않습니다. 다음은 {n + 1}단계 \"{nxt.get('title', '')}\" 입니다.")
    else:
        L.append("이 단계가 계획의 마지막입니다. 여기까지 끝나면 한 번 멈추고 실제로 써 봅니다.")
    L.append(
        "\n작업 도중 계획에 없는 것이 필요해 보이면, 먼저 저에게 물어보고 진행해 주세요."
    )

    if data.get("version", 1) > 1:
        L.append(f"\n<!-- 계획 판 {data['version']} 기준으로 만들어진 파일입니다 -->")
    return "\n".join(L) + "\n"


def warn_quality(data):
    """계획이 비어 보이면 알려 준다. 막지는 않는다."""
    out = []
    stages = data.get("stages", [])
    if len(stages) > 9:
        out.append(f"단계가 {len(stages)}개입니다. 비전공자가 따라가기엔 7단계 안쪽이 낫습니다.")
    for n, s in enumerate(stages, 1):
        if not s.get("check"):
            out.append(f"{n}단계에 '내가 직접 확인할 것'이 없습니다. 다 됐는지 스스로 판단할 수 없게 됩니다.")
        if not (s.get("ask") or s.get("prompt")):
            out.append(f"{n}단계에 '부탁하는 것'(ask)이 없습니다. 시작 파일에 무엇을 해 달라는 말이 빠집니다.")
    if not data.get("notMaking"):
        out.append("'이번에는 만들지 않는 것'이 비었습니다. 범위가 계속 늘어나는 가장 흔한 원인입니다.")
    covered = {r for s in stages for r in (s.get("reqs") or [])}
    for r in data.get("requirements", []):
        if r.get("id") not in covered:
            out.append(f"요구사항 '{r.get('title', r.get('id'))}'을 만드는 단계가 없습니다.")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("data", help="plan.json 경로")
    ap.add_argument("--out", default="./out")
    ap.add_argument("--spec", help="요구사항 마크다운 경로 (페이지에 담아 내려받게 함)")
    ap.add_argument("--no-scrub", action="store_true")
    args = ap.parse_args()

    src = Path(args.data).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)

    data = json.loads(src.read_text(encoding="utf-8"))
    if not data.get("stages"):
        sys.exit("stages 가 비어 있습니다. 단계가 없으면 그릴 계획도 없습니다.")
    if not args.no_scrub:
        data = scrub(data)

    project = data.setdefault("project", {})
    slug = project.get("slug") or re.sub(
        r"[^\w\-]+", "-", (project.get("title") or "plan").lower(), flags=re.UNICODE
    ).strip("-_") or "plan"
    project["slug"] = slug

    spec_b64 = ""
    if args.spec:
        spec_text = Path(args.spec).read_text(encoding="utf-8")
        if not args.no_scrub:
            spec_text = scrub(spec_text)
        spec_b64 = base64.b64encode(spec_text.encode("utf-8")).decode()

    # 단계마다 같은 틀의 시작 파일을 만든다. 페이지에도 담아 거기서 바로 내려받게 한다.
    briefs = out / "단계-시작-파일"
    briefs.mkdir(exist_ok=True)
    made = []
    for i, s in enumerate(data["stages"]):
        name = file_slug(i + 1, s.get("title"))
        text = render_brief(data, i)
        (briefs / name).write_text(text, encoding="utf-8")
        s["briefFile"] = name
        s["brief"] = text
        made.append(name)

    template = TEMPLATE.read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")

    # 스크립트가 중간에서 끊기면 콘솔에 "Unexpected end of input"만 남고 화면이 죽는다.
    for label, blob in (("plan.json 데이터", payload), ("요구사항 본문", spec_b64)):
        if re.search(r"</\s*script", blob, re.I):
            sys.exit(f"{label} 안에 스크립트 종료 태그가 남았습니다. 이스케이프를 확인하세요.")
    if len(re.findall(r"<script\b", template, re.I)) != len(re.findall(r"</\s*script", template, re.I)):
        sys.exit("템플릿의 script 태그 짝이 맞지 않습니다. 주석이나 문자열을 확인하세요.")

    html = template.replace("__TITLE__", project.get("title", "계획"))
    html = html.replace("__PLAN_DATA__", payload).replace("__SPEC_MD_B64__", spec_b64)

    path = out / "plan.html"
    path.write_text(html, encoding="utf-8")
    print(f"완료: {path}  ({path.stat().st_size // 1024}KB, {len(data['stages'])}단계)")
    print(f"완료: {briefs}  (단계 시작 파일 {len(made)}개)")
    for name in made:
        print(f"    {name}")

    for w in warn_quality(data):
        print(f"  살펴볼 것: {w}")


if __name__ == "__main__":
    main()
