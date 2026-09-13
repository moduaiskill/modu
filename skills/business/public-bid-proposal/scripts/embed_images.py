#!/usr/bin/env python3
"""
제안서 HTML 안의 로컬 <img src="images/..."> 를 data URI 로 바꿔 넣어
그림까지 파일 하나에 담긴 '자체 포함' HTML 로 만든다.

  python3 scripts/embed_images.py 제안서.html [--assets 이미지폴더의_상위경로]

- data: / http(s): 로 시작하는 src 는 건드리지 않는다(로고는 embed_logo.py가 이미 처리).
- 기본 탐색 경로: ① HTML 파일과 같은 폴더, ② 이 스크립트 상위의 assets/ .
  --assets 로 이미지 폴더가 들어 있는 상위 경로를 직접 지정할 수 있다.
- 인쇄(PDF) 만 할 거라면 굳이 임베드하지 않아도 된다. HTML 옆에 '이미지' 폴더만
  같이 두면 브라우저·크롬 렌더에서 그림이 보인다. 메일로 HTML 자체를 보낼 때만 임베드한다.
"""
import base64, mimetypes, os, re, sys

def find_file(src, roots):
    src = src.replace("\\", "/")
    cand = os.path.basename(src)
    for root in roots:
        for rel in (src, os.path.join("이미지", cand), os.path.join("assets", src),
                    os.path.join("assets", "이미지", cand), cand):
            p = os.path.join(root, rel)
            if os.path.isfile(p):
                return p
    return None

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    html_path = sys.argv[1]
    assets = None
    if "--assets" in sys.argv:
        assets = sys.argv[sys.argv.index("--assets") + 1]
    here = os.path.dirname(os.path.abspath(__file__))
    roots = [os.path.dirname(os.path.abspath(html_path)),
             os.path.join(here, ".."),
             os.path.join(here, "..", "assets")]
    if assets:
        roots = [assets, os.path.join(assets, "assets")] + roots

    html = open(html_path, encoding="utf-8").read()
    done, miss = [], []

    def repl(m):
        src = m.group(1)
        if src.startswith(("data:", "http:", "https:")) or src == "LOGO_PLACEHOLDER":
            return m.group(0)
        p = find_file(src, roots)
        if not p:
            miss.append(src); return m.group(0)
        mime = mimetypes.guess_type(p)[0] or "image/png"
        b64 = base64.b64encode(open(p, "rb").read()).decode()
        done.append(os.path.basename(p))
        return m.group(0).replace(src, f"data:{mime};base64,{b64}")

    html = re.sub(r'<img[^>]*\ssrc="([^"]+)"', repl, html)
    open(html_path, "w", encoding="utf-8").write(html)
    print(f"이미지 임베드 완료: {len(done)}개 → {html_path}")
    for n in done: print(f"  - {n}")
    if miss:
        print("찾지 못한 이미지(경로 확인 필요):")
        for n in miss: print(f"  ! {n}")

if __name__ == "__main__":
    main()
