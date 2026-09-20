/*
 * 기수별 활동 데이터. 기수 소개(cohorts.html)와 기수 상세(cohort.html?id=…)에서 사용합니다.
 * 회의록이 추가되면 weeks 항목의 status를 "done"으로 바꾸고 summary·link를 채웁니다.
 * 확정되지 않은 일정은 적지 않습니다. 1주차 회의록의 결정 칸이 비어 있는 항목은 미정으로 둡니다.
 */
window.cohorts = [
  {
    id: "1",
    name: "1기",
    title: "모두의 AX 도구함 TF 1기",
    period: "2026년 9월",
    status: "진행 중",
    statusClass: "shared",
    summary:
      "제주에서 시작한 첫 기수입니다. 교육·기업·공공·목회·마케팅·디자인 분야의 참여자가 한 달 동안 주 1회 만나 각자의 업무 스킬을 만들고 피드백을 나눕니다.",
    goal: "개인당 스킬 1개 이상. 실제 업무에 바로 투입할 수 있는 완성도를 목표로 하고, 최종 피드백을 거쳐 GitHub 공개 저장소와 홈페이지에 올립니다.",
    facts: [
      ["활동 기간", "2026년 9월, 최대 1개월"],
      ["정기 모임", "주 1회 온라인 · 진행 상황 공유, 데모, 피드백"],
      ["소통 채널", "카카오톡 공지 · 위니브 스페이스"],
      ["산출물 관리", "GitHub 조직 moduaiskill, 모노레포, MIT 라이선스"],
      ["산출물 기준", "Claude Code에서 가져올 수 있는 SKILL.md 폴더"],
    ],
    members: [
      {
        name: "이호준",
        field: "스타트업",
        plan: "견적서·보고서·제안서 등 스타트업에 필수인 문서 스킬 제작과 배포",
        skill: "business-documents",
      },
      {
        name: "조승호",
        field: "공공기관",
        plan: "업무에 필요한 스킬을 공공 배포용으로 별도 제작",
        skill: "public-work",
      },
      {
        name: "김현",
        field: "교육",
        plan: "초·중·고 선생님이 업무와 과목 수업에 쓸 수 있는 공공교육 스킬",
        skill: "education-support",
      },
      {
        name: "장진환",
        field: "목회",
        plan: "주중에 성도와 함께 나눌 묵상자료 피드백 스킬, 동료 목회자에게 전파",
        skill: "ministry-feedback",
      },
      {
        name: "김민영",
        field: "광고·마케팅",
        plan: "학생 동아리용 사례 조사와 프로젝트 LLM 위키, 갈무리 도구",
        skill: "marketing-research",
      },
      {
        name: "문혁재",
        field: "디자인·개발",
        plan: "디자인이 익숙하지 않은 사람을 위한 디자인 도구",
        skill: "design-support",
      },
      {
        name: "이길",
        field: "교육",
        plan: "학교안전사고 데이터를 바탕으로 유형을 분석해 주는 안전 컨설팅 스킬",
        skill: "education-support",
      },
      {
        name: "한민철",
        field: "참여자",
        plan: "관심 분야와 제작할 스킬은 확인되는 대로 채웁니다.",
        skill: null,
      },
      {
        name: "양근탁",
        field: "참여자",
        plan: "관심 분야와 제작할 스킬은 확인되는 대로 채웁니다.",
        skill: null,
      },
    ],
    weeks: [
      {
        number: 1,
        title: "오리엔테이션 · 킥오프",
        status: "done",
        date: "2026년 9월 6일 (일) 19:00~21:00",
        place: "위니브 스페이스 회의실 S3",
        summary: [
          "TF 배경 공유. 업종별·기관별 스킬을 한곳에 모아 누구나 비용 없이 가져다 쓰게 한다는 목표를 확인했습니다.",
          "참여자들이 각자의 관심 분야와 만들고 싶은 스킬을 소개했습니다.",
          "산출 목표를 개인당 스킬 1개 이상으로 정하고, 결과물은 GitHub 공개 저장소와 홈페이지로 공개하기로 했습니다.",
          "GitHub 조직 이름 moduaiskill, 모노레포 구조, MIT 라이선스를 결정했습니다.",
          "제작 대상 선정 항목(스킬 이름·사용자·사용 근거·효용)을 2주차 발표에 담기로 했습니다.",
        ],
        links: [
          { label: "1주차 회의록 원문", href: "1주차.md" },
          { label: "프로젝트 소개 원문", href: "프로젝트 소개.md" },
        ],
      },
      {
        number: 2,
        title: "개인 진행 상황 발표 · 피드백",
        status: "pending",
        summary: [
          "각자 스킬 이름, 사용자, 사용 근거, 효용을 발표하고 피드백을 받습니다.",
        ],
        pendingNote: "회의록이 올라오면 이 자리에 정리합니다.",
      },
      {
        number: 3,
        title: "개선 내용 공유 · 피드백",
        status: "pending",
        summary: ["피드백을 반영한 개선 내용을 공유하고 다시 피드백을 받습니다."],
        pendingNote: "회의록이 올라오면 이 자리에 정리합니다.",
      },
      {
        number: 4,
        title: "최종 정리",
        status: "pending",
        summary: [
          "최종 파일을 제출하고, 스킬로 만든 결과물 캡처를 함께 정리합니다.",
        ],
        pendingNote: "최종 스킬과 결과물은 스킬 목록과 결과물 페이지에 연결합니다.",
      },
    ],
    skills: [
      "public-bid-proposal",
      "md-to-hwpx",
      "meeting-notes",
      "business-documents",
      "public-work",
      "education-support",
      "ministry-feedback",
      "marketing-research",
      "design-support",
    ],
    results: [
      "proposal",
      "presentation",
      "script",
      "dashboard",
      "cardnews",
      "estimate",
      "hwpx-minutes",
      "meeting-example",
    ],
    notes: [
      "정기 모임 요일·시간은 1주차 회의록의 결정 칸이 비어 있어 확정 일정으로 안내하지 않습니다.",
      "공유 스킬 2개는 1기 시작 시점에 제공된 파일이며, 모든 모델에서 최종 검수했다는 뜻은 아닙니다.",
    ],
  },
];
