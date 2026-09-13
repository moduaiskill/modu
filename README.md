# 모두의 AI Skill

한 사람의 노하우를 모두가 가져다 쓸 수 있는 AI 스킬로 만듭니다.

**모두의 AX 도구함 TF**가 함께 만드는 공개 스킬 저장소입니다. 교육·기업·공공기관 등 현장의 반복 업무를 작은 스킬 폴더로 정리해 공유합니다. 개발 경험이 없어도 문제 제안과 사용 후기, 개선에 참여할 수 있습니다.

## 시작하기

- [프로젝트 소개 페이지](index.html) — 브라우저에서 바로 열 수 있습니다. 별도 설치나 빌드가 필요 없습니다.
- [공공 입찰 제안서](skills/business/public-bid-proposal/SKILL.md) · [ZIP](downloads/public-bid-proposal.zip) — 공고문과 기관 정보에서 A4 인쇄용 HTML 제안서를 작성합니다.
- [Markdown → HWPX](skills/public/md-to-hwpx/SKILL.md) · [ZIP](downloads/md-to-hwpx.zip) — Python 스크립트로 한글 문서를 만듭니다.
- [결과물 6종](examples/README.md) — 제공받은 기존 시연 자료를 HTML·PDF·XLSX로 살펴봅니다.
- [회의록 정리 예제](skills/common/meeting-notes/SKILL.md) — 외부 도구 없이 사용하는 시작 예제입니다. TF의 최종 검수를 마친 배포 스킬과는 구분합니다.
- [사용 가이드](docs/getting-started.md) — 일반 채팅과 Claude Code·Codex에서 사용하는 방법입니다.
- [기여 가이드](CONTRIBUTING.md) — 업무 노하우를 스킬로 만드는 방법입니다.

[전체 ZIP 다운로드](https://github.com/moduaiskill/modu/archive/refs/heads/main.zip) 또는 아래 명령으로 파일을 받습니다.

```sh
git clone https://github.com/moduaiskill/modu.git
```

## 폴더 구조

```text
modu/
├── index.html                    # 프로젝트 소개와 스킬 탐색
├── assets/
│   ├── css/style.css             # 반응형 화면
│   ├── js/catalog.js             # 제작 후보와 상태
│   ├── js/main.js                # 검색, 필터, 안내, 복사
│   ├── previews/                 # 제공된 결과물의 화면 미리보기
│   └── favicon.svg
├── skills/                       # 직접 제작한 스킬
│   ├── common/meeting-notes/     # 공통 업무 시작 예제
│   │   └── SKILL.md
│   ├── education/                # 교육
│   ├── business/public-bid-proposal/ # 제안서 스킬·양식·스크립트
│   ├── public/md-to-hwpx/        # HWPX 스킬·문서·변환 스크립트
│   ├── ministry/                 # 목회
│   ├── marketing/                # 광고·마케팅
│   └── design-development/       # 디자인·개발
├── templates/skill-template/     # 새 스킬 제작용 원본
│   └── SKILL.md
├── recommended/README.md         # 외부 스킬과 참고자료
├── examples/                     # 기존 시연 결과물 6종
├── downloads/                    # 개별 스킬 ZIP 배포본
├── scripts/package_skills.py     # ZIP 배포본 갱신
├── tests/test_hwpx.py            # HWPX 텍스트 보존 회귀 검사
├── docs/
│   ├── getting-started.md        # 도구별 사용법
│   ├── skill-standard.md         # 제작 규격과 검수 기준
│   └── example-meeting.md        # 가상 입력과 기대 결과
├── 1주차.md                      # 킥오프 회의록 원본
├── 프로젝트 소개.md             # 프로젝트 배경 원본
├── CONTRIBUTING.md
└── LICENSE
```

분야별 README는 제작 후보 안내입니다. 실제 스킬은 `skills/<분야>/<영문-스킬명>/SKILL.md`에 추가합니다. **SKILL.md가 들어 있는 개별 폴더**가 배포 단위입니다. `references/`, `assets/`, `scripts/`는 해당 스킬에 필요할 때만 추가합니다.

## 범용 스킬의 원칙

- 공통 진입점은 `name`, `description`이 있는 Markdown 파일 `SKILL.md`입니다.
- 핵심 지침은 특정 모델, 유료 서비스, 전용 명령에 의존하지 않게 작성합니다.
- 일반 채팅에서는 지침을 붙여 넣어 재사용합니다. 자동 검색·호출과 스크립트 실행은 도구마다 지원 범위가 다릅니다.
- 외부 도구가 필요하면 요구 환경을 명시합니다. 모든 모델에서 동일한 결과가 보장된다는 의미는 아닙니다.
- 직접 제작한 스킬과 웹 코드는 [MIT 라이선스](LICENSE)로 공유합니다. AI 서비스 이용료는 각 서비스 정책을 따르며, 외부 자료에는 원저작자의 라이선스가 적용됩니다.

## 1기 운영

[1주차 회의록](1주차.md)을 기준으로 2026년 9월, 한 기수 최대 1개월 동안 주 1회 온라인으로 만나 진행 상황·데모·피드백을 나눕니다. 개인당 스킬 1개 이상을 목표로 하며 마지막 주에는 최종 파일과 결과물 캡처를 정리합니다. 최종 피드백 담당은 이호준입니다.

1주차 오리엔테이션 → 2주차 진행 공유와 피드백 → 3주차 개선과 피드백 → 4주차 최종 정리.

운영 기간과 소통 방식은 이전 소개 문서보다 1주차 회의록을 우선합니다. 세부 모임 시간은 최종 결정 칸이 비어 있어 확정 일정으로 안내하지 않습니다. 홈페이지는 제공된 **공유 스킬 2개**와 **제작 후보 6개**를 구분합니다. 공유 상태는 모든 모델에서 최종 검수했다는 뜻이 아닙니다. 별도로 공통 회의록 시작 예제를 제공합니다.

제공된 `.skill` 압축 파일은 개별 스킬 폴더로 풀고 양식을 보존했습니다. HWPX 변환 스크립트는 제목의 특수문자 이중 이스케이프와 목록 단락 중복 문제를 수정했습니다. 원본 보관 폴더 `skill 결과물_참고용/`은 중복 업로드하지 않습니다. 배포용 자료는 `skills/`와 `examples/`에서 관리합니다. 시연 자료 속 과거 모집 안내나 사업 수치는 현재 공지 또는 TF의 실제 성과로 인용하지 않습니다.

## 홈페이지 관리

카드 내용은 `assets/js/catalog.js`, 화면 구성은 `index.html`에서 수정합니다. 검색과 필터는 브라우저에서 동작하며 서버로 데이터를 보내지 않습니다.

스킬 폴더를 수정한 뒤에는 `python scripts/package_skills.py`로 ZIP 배포본을 갱신합니다. 개인정보를 채운 `organization-profile.md`는 패키지와 Git에서 제외합니다. 홈페이지 자체는 외부 라이브러리를 쓰지 않지만, 일부 기존 시연 HTML은 폰트와 차트 라이브러리를 CDN에서 불러옵니다.

`index.html`을 직접 열거나 저장소에서 `python -m http.server 8000` 실행 후 `http://localhost:8000`에 접속합니다. GitHub Pages 사용 시 저장소의 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 지정합니다. `.github/workflows/pages.yml`이 `main` 푸시 시 추적 중인 파일을 그대로 게시합니다.

Pages 주소는 `https://moduaiskill.github.io/modu/`입니다. 이 사이트는 완성된 HTML을 그대로 게시하며, Jekyll을 실행하면 스킬 문서의 `{{…}}` 예시를 Liquid 템플릿으로 해석해 빌드가 실패합니다. `.nojekyll` 추가 후에도 기존 자동 빌드가 Jekyll을 실행하는 것을 확인해, Jekyll 단계가 없는 명시적 Actions 워크플로로 전환했습니다. Markdown 파일도 HTML 변환 없이 원문으로 제공됩니다. `.nojekyll`은 정적 사이트임을 나타내는 파일로 유지합니다.

SNS 공유 이미지는 [assets/social/README.md](assets/social/README.md)에 정리했습니다. `index.html`의 Open Graph와 Twitter 카드에 가로형 이미지를 연결했습니다. 배포 주소를 변경하면 `og:url`, `og:image`, `twitter:image`의 절대 주소도 함께 수정합니다.

## 확인한 범위

Chrome에서 검색, 분야 필터, 상세 안내, ZIP 링크, 사용법 탭의 키보드 이동, 복사, 모바일 메뉴를 확인했습니다. 화면 폭 320·390·768·1024·1440px에서 가로 넘침이 없고, 소개 페이지의 로컬 링크와 미리보기 이미지가 연결됩니다.

HWPX 변환은 제목·본문 특수문자, 목록, 표와 인라인 서식의 보존, ZIP/XML 구조를 확인했습니다. Python에 `markdown`과 `beautifulsoup4`가 설치된 상태에서 `python -X utf8 -m unittest discover -s tests`로 회귀 테스트 3개를 실행할 수 있습니다. 한컴오피스 최종 렌더링, 제안서 보조 도구 전체, 모델별 실제 생성 품질은 별도 확인이 필요합니다.
