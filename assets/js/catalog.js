/*
 * 스킬 카탈로그. 홈, 스킬 목록(skills.html), 스킬 상세(skill.html?id=…)에서 함께 사용합니다.
 * status — shared: 제공된 배포 파일 / example: 설치 없이 쓰는 시작 예제 / planned: 제작 후보.
 * 공유 상태는 모든 모델에서 최종 검수했다는 뜻이 아닙니다.
 */
window.skillCatalog = [
  {
    id: "public-bid-proposal",
    category: "business",
    categoryName: "기업·스타트업",
    icon: "case",
    title: "공공 입찰 제안서 작성",
    description:
      "공고문과 기관 소개를 바탕으로, 제출 요구에 맞는 A4 인쇄용 제안서를 만듭니다.",
    tags: ["HTML · PDF", "템플릿 포함"],
    audience: "공모·입찰 제안서를 준비하는 기업과 기관 실무자",
    benefit:
      "발주처의 요구사항과 대응 계획을 연결하고, 기관 정보를 재사용해 제안서 초안을 작성합니다.",
    status: "shared",
    cohort: "1",
    origin: "1기 시작 시점에 제공된 스킬",
    environment:
      "HTML 파일 작성 환경과 브라우저가 필요합니다. PDF·이미지 자동화는 별도 Python 도구가 필요하며, 모든 모델에서의 동작을 검수한 것은 아닙니다.",
    path: "skills/business/public-bid-proposal/SKILL.md",
    folder: "skills/business/public-bid-proposal/",
    download: "downloads/public-bid-proposal.zip",
    overview: [
      "공모·입찰·시담에 내는 정식 제안서를 단일 HTML 파일로 만듭니다. 브라우저에서 열어 읽고, 인쇄 한 번으로 제출용 A4 PDF가 나옵니다.",
      "기관 고정 정보(현황·역량·실적·인력)는 템플릿에 박아 두지 않고 별도 기관 정보 파일에서 가져옵니다. 한 번 채워 두면 다음 제안서에서 다시 씁니다.",
      "관공서 표준 서식과 정부 개조식 어투, 6대 영역(제안기관 현황 · 제안 개요 · 과업 수행계획 · 조직 및 인력 · 사후관리 · 사업관리)을 기본값으로 적용하고, 공고문이 지정한 목차·서식이 있으면 그쪽을 우선합니다.",
    ],
    inputs: [
      "공고문 · 제안요청서 · 과업지시서",
      "기관 정보 파일 organization-profile.md (없으면 템플릿을 복사해 작성)",
      "선택 · 기관 로고, 조직도, 행사 사진",
    ],
    files: [
      "SKILL.md — 작성 지침",
      "assets/template.html — A4 인쇄용 제안서 양식",
      "assets/organization-profile.template.md — 기관 정보 양식",
      "scripts/embed_logo.py — 표지 로고 삽입",
      "scripts/embed_images.py — 이미지를 단일 파일에 포함",
      "scripts/compress_photos.py — 사진 압축",
      "scripts/make_pdf.py — PDF 생성과 쪽 번호 검사",
    ],
    requirements: [
      "HTML 파일을 만들고 저장할 수 있는 환경",
      "브라우저 인쇄(Ctrl+P)로 PDF 저장",
      "선택 · 이미지 압축에 Pillow, 자동 PDF 생성에 WeasyPrint와 Poppler",
    ],
    steps: [
      {
        title: "기관 정보 파일을 확보합니다",
        text: "organization-profile.md가 없으면 템플릿을 복사해 채웁니다. 기관명·실적·인력 같은 사실은 이 파일에서만 가져오고 지어내지 않습니다.",
      },
      {
        title: "공고문을 읽고 요구사항을 정리합니다",
        text: "사업 목적, 과업 범위, 평가 기준과 배점, 지정 양식 유무를 정리합니다. 배점이 큰 항목을 본문에서 두껍게 씁니다.",
      },
      {
        title: "요구↔대응 매트릭스를 먼저 채웁니다",
        text: "공고문 요구를 왼쪽에, 대응 방안과 답한 절 번호를 오른쪽에 짝지어 누락을 잡습니다.",
      },
      {
        title: "6대 영역을 개조식으로 채웁니다",
        text: "명사형·'~함' 종결, (키워드) 라벨, ※ 출처 표기를 지킵니다. 확정되지 않은 수치는 비워 두고 사용자에게 확인합니다.",
      },
      {
        title: "로고를 넣고 쪽 번호를 검사합니다",
        text: "표지 로고를 삽입하고 목차 쪽 번호를 실제 PDF 기준으로 채운 뒤 제출 전 점검표를 확인합니다.",
      },
    ],
    usageExample:
      "첨부한 공고문과 organization-profile.md를 바탕으로\n공공 입찰 제안서 스킬(SKILL.md) 지침에 따라 제안서 HTML을 작성해줘.\n확정되지 않은 수치는 비워 두고 나에게 확인해줘.",
    results: ["proposal", "presentation", "script"],
    notes: [
      "제안서에는 참여 인력의 실명과 경력이 들어갑니다. 공개용 사본에는 성명을 가리고, 기관 정보 파일은 공개 저장소에 올리지 않습니다.",
      "발주처가 배포한 서식 파일(HWP 등)에 채워 넣으라는 공고에는 이 스킬이 맞지 않습니다.",
    ],
  },
  {
    id: "md-to-hwpx",
    category: "public",
    categoryName: "공공기관 · 공통 문서",
    icon: "building",
    title: "마크다운을 한글 문서로",
    description:
      "제목, 목록, 표와 글자 서식을 살려 Markdown을 한글 HWPX 파일로 변환합니다.",
    tags: ["HWPX", "Python 필요"],
    audience: "Markdown 문서를 한글 파일로 제출하거나 공유하는 실무자",
    benefit:
      "AI로 작성한 텍스트를 한글 문서로 옮기는 수작업을 줄입니다. 코드 블록·인용문·이미지는 지원하지 않습니다.",
    status: "shared",
    cohort: "1",
    origin: "1기 시작 시점에 제공된 스킬",
    environment:
      "Python과 markdown·beautifulsoup4 패키지가 필요합니다. 일반 채팅만으로는 스크립트가 실행되지 않으며, 한컴오피스에서 최종 표시를 확인하세요.",
    path: "skills/public/md-to-hwpx/SKILL.md",
    folder: "skills/public/md-to-hwpx/",
    download: "downloads/md-to-hwpx.zip",
    overview: [
      "마크다운 텍스트나 .md 파일을 한컴오피스 한글에서 열 수 있는 .hwpx 파일로 변환합니다.",
      "제목(h1~h6), 단락, 순서 있는·없는 목록, 표, 굵게·기울임 서식을 지원합니다. XML 특수문자는 자동으로 처리합니다.",
      "변환 스크립트는 한글에서 실제로 만든 HWPX 파일 구조를 그대로 따릅니다. 코드 블록, 인용문, 이미지는 아직 지원하지 않습니다.",
    ],
    inputs: ["마크다운 파일(.md) 또는 마크다운 형식의 텍스트"],
    files: [
      "SKILL.md — 변환 절차와 주의사항",
      "scripts/md_to_hwpx.py — 변환 스크립트",
      "references/hwpx-format.md — HWPX 파일 구조 참고",
    ],
    requirements: [
      "Python 3",
      "pip install markdown beautifulsoup4",
      "결과 확인용 한컴오피스 한글",
    ],
    steps: [
      {
        title: "마크다운을 준비합니다",
        text: "파일을 올리거나 텍스트를 임시 .md 파일로 저장합니다. 긴 문서는 파일로 저장한 뒤 변환하는 편이 안전합니다.",
      },
      {
        title: "패키지를 설치합니다",
        text: "markdown과 beautifulsoup4가 없으면 설치합니다.",
      },
      {
        title: "변환 스크립트를 실행합니다",
        text: "python scripts/md_to_hwpx.py 입력.md 출력.hwpx 형식으로 실행합니다.",
      },
      {
        title: "한글에서 결과를 확인합니다",
        text: "제목 크기, 표, 목록이 의도대로 보이는지 확인합니다. 표시 문제가 있으면 원본 마크다운을 단순하게 정리합니다.",
      },
    ],
    usageExample:
      "python -m pip install markdown beautifulsoup4\npython skills/public/md-to-hwpx/scripts/md_to_hwpx.py 회의록.md 회의록.hwpx",
    results: ["hwpx-minutes"],
    notes: [
      "header.xml의 서식 ID 체계를 임의로 바꾸면 한글에서 파일이 열리지 않을 수 있습니다. 확장할 때는 references/hwpx-format.md를 먼저 읽습니다.",
    ],
  },
  {
    id: "meeting-notes",
    category: "common",
    categoryName: "공통 업무",
    icon: "pen",
    title: "회의록 정리",
    description:
      "회의 메모에서 논의 내용, 결정 사항, 후속 할 일과 미정 항목을 구분한 회의록을 만듭니다.",
    tags: ["설치 불필요", "시작 예제"],
    audience: "회의 기록을 정리해 공유해야 하는 누구나",
    benefit:
      "명시적으로 합의한 내용만 결정 사항으로 적고, 없는 담당자·기한을 만들어 내지 않는 회의록을 얻습니다.",
    status: "example",
    cohort: "1",
    origin: "TF 공통 시작 예제",
    environment:
      "SKILL.md 하나로 동작합니다. 외부 도구 없이 일반 채팅에 지침을 붙여 넣어 사용할 수 있습니다.",
    path: "skills/common/meeting-notes/SKILL.md",
    folder: "skills/common/meeting-notes/",
    overview: [
      "제공받은 기록을 참석하지 않은 사람도 이해하고 다음 행동을 확인할 수 있는 회의록으로 정리합니다.",
      "안건별 논의 요약, 결정 사항, 후속 할 일 표, 미정 사항과 다음 논의 순서로 출력합니다.",
      "빈 결정 칸을 확정으로 해석하지 않고, 기록끼리 충돌하면 '확인 필요'로 표시합니다.",
    ],
    inputs: ["회의 메모, 녹취 텍스트 또는 대화 기록"],
    files: ["SKILL.md — 정리 기준과 출력 구조"],
    requirements: ["없음. 텍스트 입력만으로 사용합니다."],
    steps: [
      {
        title: "SKILL.md를 대화에 전달합니다",
        text: "일반 채팅에서는 내용을 붙여 넣고, Claude Code·Codex에서는 폴더를 설치합니다.",
      },
      {
        title: "회의 메모를 함께 전달합니다",
        text: "날짜·참석자가 없어도 주어진 내용부터 정리하고 빠진 정보는 '미정'으로 표시합니다.",
      },
      {
        title: "기대 결과와 비교합니다",
        text: "가상 회의 예제로 결정 사항, 미정 항목, 담당자와 기한이 원문대로 분리되는지 확인합니다.",
      },
    ],
    usageExample:
      "첨부하거나 붙여 넣은 SKILL.md 지침에 따라\n이 회의 메모를 정리해줘.\n결정 사항과 후속 할 일을 구분해줘.",
    results: ["meeting-example", "hwpx-minutes"],
    notes: [
      "TF의 최종 검수를 마친 배포 스킬과는 구분합니다. 모델과 도구에 따라 결과가 달라질 수 있습니다.",
    ],
  },
  {
    id: "education-support",
    category: "education",
    categoryName: "교육",
    icon: "book",
    title: "수업과 학교 업무를 더 가볍게",
    description:
      "수업 준비부터 학교 안전까지. 선생님과 학생에게 필요한 업무 스킬을 만듭니다.",
    tags: ["수업 지원", "학교 안전"],
    audience: "초·중·고 교사와 학생",
    benefit:
      "수업 준비를 돕고 학교 안전사고 자료의 유형을 이해하는 데 도움을 줍니다.",
    status: "planned",
    cohort: "1",
    members: ["김현", "이길"],
    path: "skills/education/README.md",
    folder: "skills/education/",
    overview: [
      "1기 킥오프에서 나온 제작 방향입니다. 초·중·고 선생님이 업무와 과목 수업에 쓸 수 있는 스킬, 학교안전사고 자료를 바탕으로 유형을 분석하는 컨설팅 스킬을 각각 준비합니다.",
      "세부 범위는 제작자가 정하며, 2주차 발표에서 스킬 이름·사용자·사용 근거·효용을 공유합니다.",
    ],
  },
  {
    id: "business-documents",
    category: "business",
    categoryName: "기업·스타트업",
    icon: "case",
    title: "반복되는 문서, 든든한 시작",
    description:
      "견적서, 보고서, 제안서. 작은 팀이 자주 만드는 문서를 업무에 맞게 정리합니다.",
    tags: ["견적서", "보고서"],
    audience: "스타트업 구성원과 기업 실무자",
    benefit:
      "자주 쓰는 문서의 구조를 정리해 반복적인 초안 작성 시간을 줄입니다.",
    status: "planned",
    cohort: "1",
    members: ["이호준"],
    path: "skills/business/README.md",
    folder: "skills/business/",
    overview: [
      "AX 전환을 시작하고 싶은데 어디서부터 해야 할지 모르겠다는 문의에서 출발했습니다. 견적서·보고서·제안서처럼 스타트업에 필수인 문서 스킬 5개 안팎을 만들어 배포하는 것이 1기 목표입니다.",
    ],
  },
  {
    id: "public-work",
    category: "public",
    categoryName: "공공기관",
    icon: "building",
    title: "매일의 행정에 작은 도움을",
    description:
      "반복 행정과 자료 정리. 공공기관의 업무 환경에 맞는 스킬을 준비합니다.",
    tags: ["행정 업무", "자료 정리"],
    audience: "공공기관에서 반복 행정 업무를 맡는 실무자",
    benefit:
      "공공 배포용 스킬로 반복 업무를 돕습니다. 세부 기능은 제작 과정에서 정합니다.",
    status: "planned",
    cohort: "1",
    members: ["조승호"],
    path: "skills/public/README.md",
    folder: "skills/public/",
    overview: [
      "업무에 필요한 스킬을 직접 만들고 싶어 참여한 공공기관 실무자의 제작 후보입니다. 공공 배포용으로 별도 제작합니다.",
    ],
  },
  {
    id: "ministry-feedback",
    category: "ministry",
    categoryName: "목회",
    icon: "leaf",
    title: "함께 나눌 묵상, 한 번 더 깊게",
    description:
      "주중에 함께 나눌 묵상자료를 살펴보고, 전달을 돕는 피드백을 정리합니다.",
    tags: ["묵상자료", "피드백"],
    audience: "묵상자료를 준비하는 목회자",
    benefit:
      "자료의 흐름과 전달 방식을 돌아보고 동료 목회자와 제작 방법을 공유합니다.",
    status: "planned",
    cohort: "1",
    members: ["장진환"],
    path: "skills/ministry/README.md",
    folder: "skills/ministry/",
    overview: [
      "성도들과 주중에 함께 나눌 묵상자료에 피드백을 주는 스킬입니다. 완성 후 동료 목회자에게 전파하는 것이 목표입니다.",
    ],
  },
  {
    id: "marketing-research",
    category: "marketing",
    categoryName: "광고·마케팅",
    icon: "megaphone",
    title: "흩어진 사례를 프로젝트로",
    description:
      "사례를 찾고, 자료를 갈무리하고. 학생들의 아이디어가 프로젝트로 이어지게 돕습니다.",
    tags: ["사례 조사", "자료 갈무리"],
    audience: "마케팅 프로젝트에 참여하는 학생과 동아리",
    benefit:
      "찾아둔 사례와 자료를 정리해 프로젝트를 시작할 수 있는 발판을 만듭니다.",
    status: "planned",
    cohort: "1",
    members: ["김민영"],
    path: "skills/marketing/README.md",
    folder: "skills/marketing/",
    overview: [
      "학생 동아리에서 쓸 수 있는 사례 조사와 프로젝트용 LLM 위키, 갈무리 도구를 구상합니다. 학생 입장에서 문제를 풀어 갈 진입로가 되는 도구를 목표로 합니다.",
    ],
  },
  {
    id: "design-support",
    category: "design-development",
    categoryName: "디자인·개발",
    icon: "pen",
    title: "디자인의 첫걸음을 더 쉽게",
    description:
      "디자인이 낯선 사람도 시작할 수 있도록. 작업의 진입 장벽을 낮추는 도구를 고민합니다.",
    tags: ["비전공자", "디자인 지원"],
    audience: "디자인에 익숙하지 않은 사람",
    benefit:
      "디자인 작업을 쉽게 시작하도록 돕는 것이 목표입니다. 세부 기능은 아직 정하지 않았습니다.",
    status: "planned",
    cohort: "1",
    members: ["문혁재"],
    path: "skills/design-development/README.md",
    folder: "skills/design-development/",
    overview: [
      "디자인이 익숙하지 않은 사람을 위한 도구입니다. 세부 기능은 제작 과정에서 정합니다.",
    ],
  },
];

window.skillCategories = [
  { id: "all", name: "전체" },
  { id: "common", name: "공통" },
  { id: "business", name: "기업" },
  { id: "public", name: "공공" },
  { id: "education", name: "교육" },
  { id: "ministry", name: "목회" },
  { id: "marketing", name: "마케팅" },
  { id: "design-development", name: "디자인·개발" },
];

window.skillStatusLabel = {
  shared: "공유 스킬",
  example: "시작 예제",
  planned: "제작 후보",
};
