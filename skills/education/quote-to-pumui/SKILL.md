---
name: "quote-to-pumui"
description: "학교 견적서(xlsx/xls)를 받으면 지출 목적을 물어 머릿공문(제목·본문)을 작성하고, 에듀파인 품의 품목내역 업로드용 엑셀(.xls)을 만들 때 사용"
---

# 견적서 → 머릿공문 + 품목내역 업로드 파일

학교 선생님이 견적서 파일을 주면 (1) 복사해서 붙여 넣을 수 있는 간단한 머릿공문과 (2) 에듀파인 품의 "품목내역" 일괄 업로드용 엑셀 파일을 만든다.

## 1. 입력 확인
- 견적서: .xlsx 또는 .xls. 상단에 "○○학교 귀중(귀하)", "견적금액: ₩…원정", 그 아래 품목 표(연번/품명·도서명/규격·저자·출판사/수량/단가/금액)와 "합계" 행이 있는 형식.
- 품의내역 양식(선택): 사용자가 함께 주면 머리글 행을 확인한다. 기본 양식은 시트명 `품목내역`, 1행 머리글 `내용 | 규격 | 단위 | 수량 | 예상단가`. 사용자가 준 양식의 머리글·시트명이 다르면 스크립트의 `write_xls`에서 그 머리글·순서·시트명에 맞춘다.
- 견적서 파일에 시트가 여러 개면 스크립트가 활성 시트를 우선하되, 품목 합계가 "견적금액"과 일치하는 시트를 고른다.

## 2. 지출 목적 질문 (필수, 한 번만)
사용자가 이미 말하지 않았다면 AskUserQuestion(없으면 일반 질문)으로 "어떤 돈을 지출하시나요?"를 묻는다. 답은 제목과 본문 2번 앞부분에 그대로 들어가므로 명사구로 받는다.
- 선택지 예: "전문적학습공동체 운영물품 구입", "학급운영비 물품 구입", "교과(○○) 수업 재료 구입", "도서 구입" (기타 직접 입력 가능)
- 답이 "전학공 책 사요"처럼 구어체면 "전문적학습공동체 운영도서 구입"처럼 공문체 명사구로 다듬어 쓰고, 다듬은 표현을 결과에 보여준다.
- 사용자가 자리에 없으면 품목 성격(도서/물품)으로 "○○ 물품 구입"을 추정하고 추정했다고 밝힌다.

## 3. 스크립트 실행
아래 스크립트를 작업 폴더(스크래치패드)에 `quote2pumui.py`로 그대로 저장하고 실행한다. LibreOffice(`soffice`)와 openpyxl이 필요하다(xls 읽기·쓰기, 수식 재계산에 사용). 출력 파일명은 `품목내역_업로드_<학교명>.xls`.

```bash
python3 quote2pumui.py "<견적서 경로>" --out "품목내역_업로드_<학교명>.xls"
# 옵션: --sheet 시트명(특정 시트 강제), --unit 개(단위 일괄 지정)
```

출력 JSON 확인 사항:
- `school`(학교명), `school_year`(학년도), `first_item`, `count`, `total`, `total_matches`
- `total_matches`가 false면(품목 합계 ≠ 견적금액) 공문을 만들되 두 금액을 사용자에게 알리고 어느 쪽이 맞는지 확인한다. 공문 금액은 견적서에 적힌 총 견적금액(`total`)을 쓴다.
- `school`이 null이면 사용자에게 학교명을 묻는다.
- `other_sheets`가 있으면 어느 시트를 썼는지 한 줄로 알린다.

품목내역 매핑 규칙(스크립트가 처리):
- 내용 = 품명/도서명, 규격 = 규격 열(없고 도서면 "저자 / 출판사"), 단위 = 단위 열(없으면 도서 "권", 그 외 "개"), 수량 = 수량, 예상단가 = 견적단가(수식이면 계산된 값).
- 합계·소계 행과 빈 행은 제외. 같은 품목이 여러 줄이어도 견적서 줄 그대로 각각 입력한다.

## 4. 머릿공문 작성 규칙
- 학년도: 견적서 날짜(없으면 오늘)의 학년도. 3월~12월은 그 해, 1~2월은 전년도 학년도.
- 품목: `<첫 품목명> 외 <품목 수-1>종` (품목이 1개면 품목명만).
- 금액: 견적서 총 견적금액을 천 단위 쉼표로 `480,000원`.
- 목적: 2단계에서 받은 명사구.

형식(들여쓰기와 "끝." 앞 공백 두 칸 유지, 코드블록으로 제시해 바로 복사할 수 있게):

```
제목: <학년도>학년도 <목적>

1. 관련: <학년도>학년도 <학교명> 교육계획(교육과정)

2. <학년도>학년도 <목적> 관련 아래와 같이 지출하겠습니다.
  가. 품목: <첫 품목명> 외 <n>종
  나. 금액: <총액>원.  끝.
```

## 5. 결과 전달
1. 공문 제목과 본문을 코드블록으로 제시한다.
2. 생성한 .xls를 SendUserFile로 보낸다(캡션: "에듀파인 품목내역 업로드용, N건 / 합계 ○원").
3. 확인할 점이 있으면 한두 줄만: 합계 불일치, 추정한 목적, 단위 기본값(권/개) 적용 등.
4. 파일을 열어 품목 수와 예상단가×수량 합계가 총액과 맞는지 스스로 검증한 뒤 전달한다.

## 스크립트: quote2pumui.py

```python
#!/usr/bin/env python3
"""견적서(xlsx/xls) → 머릿공문 정보(JSON) + 에듀파인 품목내역 업로드 파일(.xls)

사용법:
  python3 quote2pumui.py 견적서.xlsx --out 품목내역_업로드.xls [--sheet 시트명] [--unit 권]
출력: stdout에 JSON(school, total, items, first_item, count, sheet, check ...)
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile
import openpyxl

HDR = {
    "name":  ["도서명", "품명", "품목", "상품명", "제품명", "내용", "명칭", "품 명"],
    "spec":  ["규격", "사양", "모델"],
    "unit":  ["단위"],
    "qty":   ["수량"],
    "price": ["견적단가", "단가", "예상단가", "판매가"],
    "amount":["견적금액", "금액", "합계금액", "공급가액"],
    "author":["저자", "지은이"],
    "pub":   ["출판사", "발행처"],
}

def norm(s):
    return re.sub(r"\s+", "", str(s)) if s is not None else ""

def soffice_convert(path, fmt, outdir):
    subprocess.run(["soffice", "--headless", "--calc", "--convert-to", fmt, "--outdir", outdir, path],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    base = os.path.splitext(os.path.basename(path))[0]
    ext = fmt.split(":")[0]
    return os.path.join(outdir, f"{base}.{ext}")

def load(path, tmp):
    """xls면 xlsx로 변환, 수식 캐시값이 없으면 LibreOffice로 재계산."""
    src = os.path.join(tmp, "src" + os.path.splitext(path)[1].lower())
    shutil.copy(path, src)
    if src.endswith(".xls"):
        src = soffice_convert(src, "xlsx", tmp)
    wb_f = openpyxl.load_workbook(src)
    wb_v = openpyxl.load_workbook(src, data_only=True)
    missing = any(c.data_type == "f" and wb_v[ws.title][c.coordinate].value is None
                  for ws in wb_f for row in ws.iter_rows() for c in row)
    if missing:
        d2 = os.path.join(tmp, "recalc"); os.makedirs(d2, exist_ok=True)
        src = soffice_convert(src, "xlsx", d2)
        wb_v = openpyxl.load_workbook(src, data_only=True)
    return wb_v

def to_num(v):
    if isinstance(v, (int, float)): return v
    s = re.sub(r"[^\d.\-]", "", str(v or ""))
    try: return float(s) if s else None
    except ValueError: return None

def find_header(ws):
    for r in range(1, min(ws.max_row, 60) + 1):
        cols = {}
        for c in range(1, ws.max_column + 1):
            v = norm(ws.cell(r, c).value)
            if not v: continue
            for key, words in HDR.items():
                if key in cols: continue
                if any(v == norm(w) for w in words):
                    cols[key] = c
        if "name" in cols and "qty" in cols and ("price" in cols or "amount" in cols):
            return r, cols
    return None, None

def parse_sheet(ws):
    info = {"sheet": ws.title, "school": None, "stated_total": None, "date_text": None}
    for row in ws.iter_rows(max_row=min(ws.max_row, 30)):
        for c in row:
            v = str(c.value) if c.value is not None else ""
            if not info["school"] and re.search(r"(귀중|귀하|앞)\s*$", v.strip()):
                info["school"] = re.sub(r"\s*(귀중|귀하|앞)\s*$", "", v.strip()).strip()
            if info["stated_total"] is None and "견적금액" in norm(v) and re.search(r"\d", v):
                info["stated_total"] = to_num(v.split(":")[-1])
            if not info["date_text"] and re.search(r"20\d\d\s*년", v):
                info["date_text"] = v.strip()
    hr, cols = find_header(ws)
    if not hr:
        return info, []
    items = []
    for r in range(hr + 1, ws.max_row + 1):
        g = lambda k: ws.cell(r, cols[k]).value if k in cols else None
        name = g("name")
        nname = norm(name)
        if not nname: continue
        if re.match(r"^(합계|총계|소계|총액|이하여백)", nname) or nname in ("계", "합") or re.match(r"^합계?\(", nname):
            if info["stated_total"] is None:
                info["stated_total"] = to_num(g("amount"))
            break
        qty = to_num(g("qty")) or 0
        price = to_num(g("price"))
        amount = to_num(g("amount"))
        if price is None and amount is not None and qty:
            price = amount / qty
        if amount is None and price is not None:
            amount = price * qty
        if not qty and not price: continue
        spec = g("spec")
        if spec is None and ("author" in cols or "pub" in cols):
            spec = " / ".join(str(x).strip() for x in (g("author"), g("pub")) if x)
        items.append({"name": str(name).strip(), "spec": (str(spec).strip() if spec else ""),
                      "unit": (str(g("unit")).strip() if g("unit") else ""),
                      "qty": qty, "price": price, "amount": amount,
                      "is_book": "author" in cols or "pub" in cols or "도서" in norm(ws.cell(hr, cols["name"]).value)})
    return info, items

def school_year(date_text):
    import datetime
    y, m = None, None
    if date_text:
        mm = re.search(r"(20\d\d)\s*년\s*(\d{1,2})?", date_text)
        if mm: y = int(mm.group(1)); m = int(mm.group(2)) if mm.group(2) else None
    today = datetime.date.today()
    if y is None: y, m = today.year, today.month
    if m is None: m = today.month if y == today.year else 3
    return y - 1 if m <= 2 else y

def fmt_int(x):
    return int(round(x)) if x is not None and abs(x - round(x)) < 1e-6 else x

def write_xls(items, out, unit_default):
    tmp = tempfile.mkdtemp()
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "품목내역"
    ws.append(["내용", "규격", "단위", "수량", "예상단가"])
    for it in items:
        unit = it["unit"] or unit_default or ("권" if it["is_book"] else "개")
        ws.append([it["name"], it["spec"], unit, fmt_int(it["qty"]), fmt_int(it["price"])])
    for col, w in zip("ABCDE", (50, 30, 8, 8, 12)):
        ws.column_dimensions[col].width = w
    x = os.path.join(tmp, "품목내역.xlsx"); wb.save(x)
    if out.lower().endswith(".xls"):
        res = soffice_convert(x, 'xls:MS Excel 97', tmp)
        shutil.move(res, out)
    else:
        shutil.move(x, out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("quote"); ap.add_argument("--out", required=True)
    ap.add_argument("--sheet"); ap.add_argument("--unit")
    a = ap.parse_args()
    tmp = tempfile.mkdtemp()
    wb = load(a.quote, tmp)
    sheets = [wb[a.sheet]] if a.sheet else ([wb.active] + [s for s in wb.worksheets if s is not wb.active])
    candidates = []
    for ws in sheets:
        info, items = parse_sheet(ws)
        if items:
            s = sum(i["amount"] or 0 for i in items)
            candidates.append((info, items, s))
    if not candidates:
        print(json.dumps({"error": "품목 표(품명/수량/단가 머리글)를 찾지 못했습니다."}, ensure_ascii=False)); sys.exit(1)
    # 활성 시트 우선, 단 활성 시트 합계가 명시 금액과 다르고 다른 시트가 맞으면 그 시트
    pick = candidates[0]
    for c in candidates:
        if c[0]["stated_total"] and abs(c[2] - c[0]["stated_total"]) < 1:
            pick = c; break
    info, items, s = pick
    write_xls(items, a.out, a.unit)
    total = info["stated_total"] or s
    res = {
        "sheet": info["sheet"], "other_sheets": [c[0]["sheet"] for c in candidates if c is not pick],
        "school": info["school"], "school_year": school_year(info["date_text"]),
        "first_item": items[0]["name"], "count": len(items),
        "item_sum": fmt_int(s), "stated_total": fmt_int(info["stated_total"]),
        "total": fmt_int(total), "total_matches": info["stated_total"] is None or abs(s - info["stated_total"]) < 1,
        "out": a.out,
        "items": [{k: fmt_int(v) if isinstance(v, float) else v for k, v in i.items() if k != "is_book"} for i in items],
    }
    print(json.dumps(res, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
```