# HWPX 파일 포맷 레퍼런스

이 문서는 HWPX 포맷의 상세 구조를 설명한다. 변환 스크립트를 확장할 때 참고한다.

## 목차

1. [HWPX 파일 구조](#1-hwpx-파일-구조)
2. [XML 네임스페이스](#2-xml-네임스페이스)
3. [핵심 파일 상세](#3-핵심-파일-상세)
4. [단위 및 상수](#4-단위-및-상수)
5. [charPrIDRef 매핑](#5-charPrIDRef-매핑)
6. [paraPrIDRef 매핑](#6-paraPrIDRef-매핑)
7. [borderFillIDRef 매핑](#7-borderFillIDRef-매핑)
8. [이미지 삽입 구현](#8-이미지-삽입-구현)
9. [페이지 나누기 구현](#9-페이지-나누기-구현)
10. [머리글/바닥글 구현](#10-머리글바닥글-구현)
11. [각주 구현](#11-각주-구현)

---

## 1. HWPX 파일 구조

HWPX는 ZIP 기반의 한컴오피스 한글 문서 포맷이다 (KS X 6101 / OWPML 기반).

```
output.hwpx (ZIP)
├── mimetype                  # "application/hwp+zip" (비압축, 반드시 첫 번째 항목)
├── settings.xml              # 애플리케이션 설정
├── version.xml               # HWPX 버전 정보
├── META-INF/
│   ├── container.xml         # 루트 파일 목록
│   ├── container.rdf         # RDF 메타데이터
│   └── manifest.xml          # 매니페스트
├── Contents/
│   ├── content.hpf           # 문서 메타데이터 + 매니페스트 + spine
│   ├── header.xml            # 폰트, 스타일, 문단 속성 정의
│   └── section0.xml          # 실제 문서 내용 (본문)
└── Preview/
    └── PrvText.txt           # 미리보기 텍스트 (최대 100자)
```

mimetype 파일은 반드시 ZIP의 첫 번째 항목이어야 하고, 압축하지 않고(ZIP_STORED) 저장해야 한다.

---

## 2. XML 네임스페이스

| 접두사 | URI | 용도 |
|---|---|---|
| hh | http://www.hancom.co.kr/hwpml/2011/head | 문서 헤더 |
| hp | http://www.hancom.co.kr/hwpml/2011/paragraph | 문단, 텍스트 런 |
| hs | http://www.hancom.co.kr/hwpml/2011/section | 섹션 |
| hc | http://www.hancom.co.kr/hwpml/2011/core | 핵심 공통 요소 |
| ha | http://www.hancom.co.kr/hwpml/2011/app | 애플리케이션 설정 |
| opf | http://www.idpf.org/2007/opf/ | OPF 패키지 |

---

## 3. 핵심 파일 상세

### Contents/header.xml

문서 전체의 스타일 참조 정보를 담고 있다.

- fontfaces: 7개 언어별 폰트 정의
- borderFills: 테두리/채우기 스타일
- charProperties: 글자 속성 (굵기, 크기, 색상 등)
- paraProperties: 문단 속성 (정렬, 여백, 줄간격 등)
- styles: 문단 스타일 ("바탕글" 등)

### Contents/section0.xml

본문 내용이 들어가는 파일. 각 요소는 `<hp:p>` (문단) 안의 `<hp:run>` (텍스트 런)으로 배치된다.

첫 번째 문단에는 반드시 `<hp:secPr>`(섹션 속성)이 포함되어야 한다. 용지 크기, 여백, 각주/미주 설정 등이 여기에 정의된다.

---

## 4. 단위 및 상수

| 항목 | 값 | 설명 |
|---|---|---|
| HWPUNIT 기준 | 1 HWPUNIT ≈ 0.01mm | 한컴 내부 단위 |
| 용지 크기 (A4) | width=59528, height=84186 | 약 210mm x 297mm |
| 기본 여백 | left=8504, right=8504, top=5668, bottom=4252 | header/footer=4252 |
| 본문 영역 폭 | horzsize=42520 | 여백 제외 |
| 기본 글자 크기 | height=1000 | 약 10pt |
| h1 글자 크기 | height=1600 | 약 16pt, bold |
| h2 글자 크기 | height=1400 | 약 14pt, bold |
| h3~h6 글자 크기 | height=1200 | 약 12pt, bold |
| 줄간격 | 160% | PERCENT 타입 |
| 이미지 변환 | 1px ≈ 2.835 HWPUNIT | 72dpi 기준 |

---

## 5. charPrIDRef 매핑

현재 스크립트에서 정의한 글자 속성들. 한글에서 실제 생성한 샘플 파일 기반.

| ID | 용도 | 폰트 | borderFillIDRef | 특수 속성 |
|---|---|---|---|---|
| 0 | 본문 일반 (한컴바탕) | fontRef=0 | 1 | - |
| 1 | 표 셀 일반 (함초롬돋움) | fontRef=1 | 2 | - |
| 2 | 표 셀 기울임 (함초롬돋움) | fontRef=1 | 2 | italic |
| 3 | 표 셀 굵게 (함초롬돋움) | fontRef=1 | 2 | bold |
| 4 | 본문 굵게 (함초롬돋움) | fontRef=1 | 2 | bold |
| 5 | 본문 기울임 (함초롬돋움) | fontRef=1 | 2 | italic |
| 6 | 본문 굵게+기울임 (함초롬돋움) | fontRef=1 | 2 | italic + bold |
| 7 | 제목 h1 (함초롬돋움) | fontRef=1 | 2 | bold, height=1600 (16pt) |
| 8 | 제목 h2 (함초롬돋움) | fontRef=1 | 2 | bold, height=1400 (14pt) |
| 9 | 제목 h3~h6 (함초롬돋움) | fontRef=1 | 2 | bold, height=1200 (12pt) |

제목은 전용 charPr(id=7,8,9)을 사용하며, charPr의 height 값과 lineseg의 vertsize가 반드시 일치해야 한다.

---

## 6. paraPrIDRef 매핑

| ID | 용도 | 정렬 | 왼쪽 여백 | 특수 |
|---|---|---|---|---|
| 0 | 기본 | JUSTIFY | 0 | - |
| 1 | 인용문 | JUSTIFY | 2000 | 왼쪽 테두리(borderFill=4) |
| 2 | 수평선 | JUSTIFY | 0 | 줄간격 50%, 하단 테두리(borderFill=6) |
| 3 | 목록 1단계 | LEFT | 0 | - |
| 4 | 목록 2단계 | LEFT | 1500 | - |
| 5 | 목록 3단계 | LEFT | 3000 | - |
| 6 | 가운데 정렬 | CENTER | 0 | - |
| 7 | 오른쪽 정렬 | RIGHT | 0 | - |

---

## 7. borderFillIDRef 매핑

현재 스크립트에서 정의한 테두리/채우기 속성들. 한글 샘플 기반.

| ID | 용도 | 설명 |
|---|---|---|
| 1 | 기본 (테두리 없음) | 모든 방향 NONE, charPr id=0 에서 사용 |
| 2 | charPr용 기본 | 테두리 없음, fillBrush(hatchColor=#999999) 포함, charPr id=1~6 에서 사용 |
| 3 | 표 테두리 | 사방 SOLID 0.12mm #000000, 표 및 셀의 borderFillIDRef로 사용 |

---

## 8. 이미지 삽입 구현

마크다운의 `![alt](path)` 구문을 HWPX 이미지로 변환하려면 다음이 필요하다.

### 파일 구조 변경

```
output.hwpx (ZIP)
├── BinData/
│   └── image0.png          # 이미지 바이너리
├── Contents/
│   ├── content.hpf         # 매니페스트에 이미지 항목 추가
│   └── section0.xml        # <hp:pic> 요소로 이미지 참조
└── ...
```

### content.hpf 매니페스트에 추가

```xml
<opf:item id="image0" href="BinData/image0.png" media-type="image/png" isEmbeded="1"/>
```

### section0.xml에서 이미지 삽입

```xml
<hp:p id="0" paraPrIDRef="0">
  <hp:run charPrIDRef="6">
    <hp:pic id="pic0" width="28000" height="21000">
      <hp:picPr shapeType="pic" shapeId="1"
                textWrap="TOP_AND_BOTTOM" textFlow="NONE">
        <hp:imgData href="BinData/image0.png" imgType="png"/>
      </hp:picPr>
    </hp:pic>
  </hp:run>
</hp:p>
```

이미지 크기: `PIL.Image.open().size`로 가져와서 1px ≈ 2.835 HWPUNIT로 변환.

---

## 9. 페이지 나누기 구현

### 다중 섹션 파일 구조

```
Contents/
├── section0.xml    # 첫 번째 페이지
├── section1.xml    # 두 번째 페이지
└── section2.xml    # 세 번째 페이지
```

### content.hpf 수정

manifest와 spine에 각 섹션을 추가. header.xml의 `secCnt` 속성도 섹션 수에 맞게 업데이트.

### container.rdf 수정

각 추가 섹션에 대해 RDF 항목을 추가.

---

## 10. 머리글/바닥글 구현

section0.xml의 `<hp:secPr>` 안에 `<hp:masterPage>`를 추가한다.

```xml
<hp:masterPage>
  <hp:header>
    <hp:p id="0" paraPrIDRef="0" styleIDRef="0">
      <hp:run charPrIDRef="6"><hp:t>문서 제목</hp:t></hp:run>
    </hp:p>
  </hp:header>
  <hp:footer>
    <hp:p id="0" paraPrIDRef="0" styleIDRef="0">
      <hp:run charPrIDRef="6">
        <hp:ctrl><hp:autoNum numType="PAGE"/></hp:ctrl>
      </hp:run>
    </hp:p>
  </hp:footer>
</hp:masterPage>
```

---

## 11. 각주 구현

`markdown` 라이브러리의 `footnotes` 확장 필요.

```xml
<hp:run charPrIDRef="6">
  <hp:ctrl>
    <hp:footNote autoNum="1">
      <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="BASELINE">
        <hp:p id="0" paraPrIDRef="0" styleIDRef="0">
          <hp:run charPrIDRef="6"><hp:t>각주 내용</hp:t></hp:run>
        </hp:p>
      </hp:subList>
    </hp:footNote>
  </hp:ctrl>
</hp:run>
```

---

## 참조 자료

- 한컴테크 HWPX 포맷 구조: https://tech.hancom.com/hwpxformat/
- python-hwpx (GitHub): https://github.com/airmang/python-hwpx
- hancom-io/hwpx-owpml-model (GitHub): https://github.com/hancom-io/hwpx-owpml-model
