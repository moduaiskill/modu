# 견적서 발행 스킬 (quote-issue) 설치 안내

## 구성

- `quote-issue\` — Claude Code 스킬 (견적서 양식·스크립트 포함)
- `quote-issue\starter\견적예상매출\` — 작업 폴더 시작 세트 (빈 발행대장 + 매출소득관리). `견적서\` 폴더는 비어 있어 저장소에 없으니 같은 위치에 직접 만든다.

> 공개본 안내: `assets/quote_template.xlsx`의 회사명·주소·사업자번호·담당자 연락처는 ○ 표시로, 로고·직인은 자리표시 이미지로 바꿨다. 자기 회사 양식으로 교체해서 쓴다(셀 위치는 `references/file-structures.md` 참고).

## 설치 순서

1. **스킬 설치**: `quote-issue` 폴더를 통째로 아래 위치에 복사한다.
   ```
   C:\Users\<내계정>\.claude\skills\quote-issue
   ```
   (`.claude\skills` 폴더가 없으면 만들면 된다)

2. **작업 폴더 설치**: `starter\견적예상매출` 폴더를 원하는 위치에 복사한다.
   예: `C:\Users\<내계정>\Documents\Claude\견적예상매출`
   - `견적서발행대장.xlsx`와 `매출소득관리.xlsx`는 **반드시 같은 폴더에** 둘 것
     (상대경로 외부 링크로 연결되어 있음)
   - `견적서\` 폴더도 같은 위치에 유지

3. **기본 경로 수정**: `quote-issue\SKILL.md`를 열어 "파일 위치" 절의
   `C:\Users\<사용자>\Documents\Claude\견적예상매출` 부분을
   2번에서 정한 실제 경로로 고친다.
   (Claude Code를 작업 폴더에서 실행한다면 안 고쳐도 동작함)

## 필요 프로그램

- **Python 3** + openpyxl (`pip install openpyxl`)
- **LibreOffice** — 수식 재계산용. https://www.libreoffice.org 에서 설치
  (기본 경로 `C:\Program Files\LibreOffice`에 설치할 것)

## 사용법

Claude Code를 작업 폴더(견적예상매출)에서 열고 이렇게 말하면 된다:

> ㈜테스트에 줄 견적서 만들어줘. 견적명은 'OO 시스템 v1.0', 공급가액 500만원.

견적서 생성 → 발행대장 기입 → 매출소득관리 동기화까지 자동으로 처리된다.

## 주의

- 발행대장·매출소득관리를 Excel로 열어 둔 채 스킬을 실행하지 말 것
  (스킬이 닫아 달라고 요청함)
- 매출소득관리의 입금일·인건비·자재비 열은 직접 입력하는 칸이다.
  입금액 열은 견적금액이 자동 반영되는 수식(`=E행`)으로 되어 있으며,
  실제 입금액이 다르면 그 칸에 숫자를 직접 덮어쓰면 된다.
  합계금액은 입금일이 적힌 행만 집계한다.
