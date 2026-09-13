/* shared: 제공된 배포 파일. planned: 1주차 제작 후보. 모델별 검수 완료와 구분합니다. */
window.skillCatalog = [
  {
    id: "public-bid-proposal",
    category: "business",
    categoryName: "기업·스타트업",
    icon: "case",
    tone: "orange",
    title: "공공 입찰 제안서 작성",
    description:
      "공고문과 기관 소개를 바탕으로, 제출 요구에 맞는 A4 인쇄용 제안서를 만듭니다.",
    tags: ["HTML · PDF", "템플릿 포함"],
    audience: "공모·입찰 제안서를 준비하는 기업과 기관 실무자",
    benefit:
      "발주처의 요구사항과 대응 계획을 연결하고, 기관 정보를 재사용해 제안서 초안을 작성합니다.",
    status: "shared",
    environment:
      "공유된 스킬입니다. HTML 파일 작성 환경과 브라우저가 필요합니다. PDF·이미지 자동화는 별도 Python 도구가 필요하며, 모든 모델에서의 동작을 검수한 것은 아닙니다.",
    path: "skills/business/public-bid-proposal/SKILL.md",
    download: "downloads/public-bid-proposal.zip",
  },
  {
    id: "md-to-hwpx",
    category: "public",
    categoryName: "공공기관 · 공통 문서",
    icon: "building",
    tone: "green",
    title: "마크다운을 한글 문서로",
    description:
      "제목, 목록, 표와 글자 서식을 살려 Markdown을 한글 HWPX 파일로 변환합니다.",
    tags: ["HWPX", "Python 필요"],
    audience: "Markdown 문서를 한글 파일로 제출하거나 공유하는 실무자",
    benefit:
      "AI로 작성한 텍스트를 한글 문서로 옮기는 수작업을 줄입니다. 코드 블록·인용문·이미지는 지원하지 않습니다.",
    status: "shared",
    environment:
      "공유된 변환 스킬입니다. Python과 markdown·beautifulsoup4 패키지가 필요합니다. 일반 채팅만으로는 스크립트가 실행되지 않으며, 한컴오피스에서 최종 표시를 확인하세요.",
    path: "skills/public/md-to-hwpx/SKILL.md",
    download: "downloads/md-to-hwpx.zip",
  },
  {
    id: "education-support",
    category: "education",
    categoryName: "교육",
    icon: "book",
    tone: "blue",
    title: "수업과 학교 업무를 더 가볍게",
    description:
      "수업 준비부터 학교 안전까지. 선생님과 학생에게 필요한 업무 스킬을 만듭니다.",
    tags: ["수업 지원", "학교 안전"],
    audience: "초·중·고 교사와 학생",
    benefit:
      "수업 준비를 돕고 학교 안전사고 자료의 유형을 이해하는 데 도움을 줍니다.",
    status: "planned",
    path: "skills/education/README.md",
  },
  {
    id: "business-documents",
    category: "business",
    categoryName: "기업·스타트업",
    icon: "case",
    tone: "orange",
    title: "반복되는 문서, 든든한 시작",
    description:
      "견적서, 보고서, 제안서. 작은 팀이 자주 만드는 문서를 업무에 맞게 정리합니다.",
    tags: ["견적서", "보고서"],
    audience: "스타트업 구성원과 기업 실무자",
    benefit:
      "자주 쓰는 문서의 구조를 정리해 반복적인 초안 작성 시간을 줄입니다.",
    status: "planned",
    path: "skills/business/README.md",
  },
  {
    id: "public-work",
    category: "public",
    categoryName: "공공기관",
    icon: "building",
    tone: "green",
    title: "매일의 행정에 작은 도움을",
    description:
      "반복 행정과 자료 정리. 공공기관의 업무 환경에 맞는 스킬을 준비합니다.",
    tags: ["행정 업무", "자료 정리"],
    audience: "공공기관에서 반복 행정 업무를 맡는 실무자",
    benefit:
      "공공 배포용 스킬로 반복 업무를 돕습니다. 세부 기능은 제작 과정에서 정합니다.",
    status: "planned",
    path: "skills/public/README.md",
  },
  {
    id: "ministry-feedback",
    category: "ministry",
    categoryName: "목회",
    icon: "leaf",
    tone: "purple",
    title: "함께 나눌 묵상, 한 번 더 깊게",
    description:
      "주중에 함께 나눌 묵상자료를 살펴보고, 전달을 돕는 피드백을 정리합니다.",
    tags: ["묵상자료", "피드백"],
    audience: "묵상자료를 준비하는 목회자",
    benefit:
      "자료의 흐름과 전달 방식을 돌아보고 동료 목회자와 제작 방법을 공유합니다.",
    status: "planned",
    path: "skills/ministry/README.md",
  },
  {
    id: "marketing-research",
    category: "marketing",
    categoryName: "광고·마케팅",
    icon: "megaphone",
    tone: "pink",
    title: "흩어진 사례를 프로젝트로",
    description:
      "사례를 찾고, 자료를 갈무리하고. 학생들의 아이디어가 프로젝트로 이어지게 돕습니다.",
    tags: ["사례 조사", "자료 갈무리"],
    audience: "마케팅 프로젝트에 참여하는 학생과 동아리",
    benefit:
      "찾아둔 사례와 자료를 정리해 프로젝트를 시작할 수 있는 발판을 만듭니다.",
    status: "planned",
    path: "skills/marketing/README.md",
  },
  {
    id: "design-support",
    category: "design-development",
    categoryName: "디자인·개발",
    icon: "pen",
    tone: "yellow",
    title: "디자인의 첫걸음을 더 쉽게",
    description:
      "디자인이 낯선 사람도 시작할 수 있도록. 작업의 진입 장벽을 낮추는 도구를 고민합니다.",
    tags: ["비전공자", "디자인 지원"],
    audience: "디자인에 익숙하지 않은 사람",
    benefit:
      "디자인 작업을 쉽게 시작하도록 돕는 것이 목표입니다. 세부 기능은 아직 정하지 않았습니다.",
    status: "planned",
    path: "skills/design-development/README.md",
  },
];
