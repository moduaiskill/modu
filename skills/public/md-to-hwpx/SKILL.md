---
name: md-to-hwpx
description: "마크다운(Markdown) 파일이나 텍스트를 한글(HWPX) 문서로 변환하는 스킬. 사용자가 마크다운 파일(.md)을 업로드하거나 마크다운 형식의 텍스트를 제공하면, 한컴오피스 한글에서 열 수 있는 .hwpx 파일로 변환한다. '마크다운을 한글로', 'md를 hwpx로', '한글 문서로 변환', '마크다운 변환', '.md 파일을 .hwpx로', 'hwpx로 만들어줘', '한글 파일로 저장' 같은 요청이 들어오면 이 스킬을 사용할 것. 사용자가 마크다운 내용을 작성한 뒤 '한글 문서로 만들어줘'라고 하거나, .md 파일을 올리면서 '이거 hwpx로 바꿔줘'라고 해도 트리거되어야 한다. 보고서, 문서, 글 등을 작성해서 한글 파일(.hwpx)로 내보내달라는 요청에도 반드시 사용한다."
---

# 마크다운 → HWPX 변환 스킬

## 이 스킬이 하는 일

마크다운 텍스트 또는 .md 파일을 한컴오피스 한글에서 열 수 있는 .hwpx 파일로 변환한다.

이 스킬의 변환 스크립트는 한컴오피스 한글에서 실제 정상 동작이 검증된 HWPX 파일 구조를 기반으로 만들어졌다. header.xml, settings.xml, version.xml 등 모든 메타데이터 파일은 검증된 샘플과 동일한 구조로 생성된다.

## 지원하는 마크다운 요소

- 제목 (h1~h6): h1은 16pt bold, h2는 14pt bold, h3~h6은 12pt bold
- 일반 단락
- 순서 없는 목록 (• 불릿, 각 항목 별도 문단)
- 순서 있는 목록 (1., 2., 3. 번호, 각 항목 별도 문단)
- 인라인 서식: **굵게**(bold), *기울임*(italic), ***굵게+기울임***(bold+italic)
  - 단락, 목록, 표 셀 내에서 모두 지원
- 표(Table): 마크다운 표 문법 지원, 셀 내 인라인 서식 포함
- XML 특수문자 자동 이스케이프 (`<`, `>`, `&`)

## charPr ID 매핑 (header.xml)

스크립트가 사용하는 charPr ID 체계. header.xml 수정 시 반드시 참고해야 한다.

- id=0: 본문 일반 (한컴바탕, fontRef=0, borderFillIDRef=1)
- id=1: 표 셀 일반 (함초롬돋움, fontRef=1, borderFillIDRef=2)
- id=2: 표 셀 기울임 (함초롬돋움, italic)
- id=3: 표 셀 굵게 (함초롬돋움, bold)
- id=4: 본문 굵게 (함초롬돋움, fontRef=1, bold)
- id=5: 본문 기울임 (함초롬돋움, fontRef=1, italic)
- id=6: 본문 굵게+기울임 (함초롬돋움, fontRef=1, italic+bold)
- id=7: 제목 h1 (함초롬돋움, fontRef=1, borderFillIDRef=2, bold, height=1600)
- id=8: 제목 h2 (함초롬돋움, fontRef=1, borderFillIDRef=2, bold, height=1400)
- id=9: 제목 h3~h6 (함초롬돋움, fontRef=1, borderFillIDRef=2, bold, height=1200)

## 작업 흐름

### 1단계: 마크다운 내용 확보

사용자가 제공하는 입력은 두 가지 형태 중 하나다.

- .md 파일을 직접 업로드한 경우 → 파일 경로를 사용
- 대화 중 마크다운 텍스트를 제공한 경우 → 텍스트를 임시 .md 파일로 저장

사용자가 "보고서 작성해서 한글로 저장해줘"처럼 내용 생성까지 요청하는 경우에는, 먼저 마크다운 형식으로 내용을 작성한 뒤 변환을 진행한다.

### 2단계: 의존성 설치 확인

변환 스크립트는 `markdown`과 `beautifulsoup4` 패키지가 필요하다. 변환 실행 전에 설치되어 있는지 확인한다.

```bash
python -m pip install markdown beautifulsoup4
```

### 3단계: 변환 실행

번들된 스크립트를 실행하여 변환한다.

마크다운 파일이 있는 경우:
```bash
python <skill-path>/scripts/md_to_hwpx.py <input.md> <output.hwpx>
```

마크다운 텍스트를 직접 전달하는 경우:
```bash
python <skill-path>/scripts/md_to_hwpx.py --content "<markdown text>" <output.hwpx>
```

텍스트가 긴 경우에는 임시 .md 파일에 먼저 저장한 뒤 파일 경로로 변환하는 것이 안전하다.

```bash
# 임시 파일에 마크다운 저장
cat > /tmp/temp_doc.md << 'MDEOF'
# 제목
본문 내용...
MDEOF

# 변환 실행
python <skill-path>/scripts/md_to_hwpx.py /tmp/temp_doc.md <output.hwpx>
```

### 4단계: 결과 전달

변환된 .hwpx 파일을 사용자가 접근할 수 있는 위치에 저장하고 링크를 제공한다.

## 주의사항

- Python과 패키지를 실행할 수 있는 환경이 필요하다. 일반 채팅에서 실행 도구를 지원하지 않으면 변환 완료를 주장하지 말고 Markdown 원문과 로컬 실행 방법을 제공한다.
- 경로는 이 `SKILL.md`가 있는 폴더를 기준으로 해석한다. 환경마다 다른 임시 경로와 셸 문법은 사용하는 운영체제에 맞게 적용한다.
- 문서 구조는 제공된 구현을 유지한다. 이 저장소에서의 ZIP/XML 구조 검사는 한컴오피스에서의 최종 화면 검수를 대체하지 않는다.

- 출력 파일명은 사용자가 지정하지 않으면 마크다운 파일 이름에서 확장자만 바꿔서 사용한다 (예: `report.md` → `report.hwpx`)
- XML 특수문자(`<`, `>`, `&`)는 스크립트가 자동으로 이스케이프하므로 별도 처리가 필요 없다
- HWPX 파일 구조(header.xml의 borderFills, charProperties, paraProperties 등)는 한글에서 실제 생성한 샘플 파일과 동일한 값을 사용한다. 임의로 수정하면 한글에서 파일이 열리지 않거나 무한 로딩이 발생할 수 있다
- 표(Table)의 기본 넓이는 본문 텍스트 영역(42520 HWPUNIT)에 맞춰져 있다
- 코드 블록, 인용문, 이미지 등은 현재 지원하지 않는다

## 확장이 필요한 경우

현재 스크립트로 처리할 수 없는 고급 기능이 필요한 경우, `references/hwpx-format.md`에 HWPX 파일 포맷의 상세 구조가 문서화되어 있다. 이 레퍼런스를 참고하여 스크립트를 확장할 수 있다.

확장 시 핵심 원칙:
- header.xml에 새로운 charPr, paraPr, borderFill을 추가할 때는 반드시 한글에서 실제로 생성한 샘플 파일을 분석하여 구조를 맞춰야 한다
- 참고 문서의 추측이나 추론이 아닌, 실제 한글 출력물의 XML 구조가 유일한 정답이다
- itemCnt 값, charPr id, fontRef, borderFillIDRef 등은 한글이 매우 민감하게 처리하므로 한 값이라도 틀리면 무한 로딩이 발생한다
