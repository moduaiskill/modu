/*
 * 스킬 카탈로그. 홈, 스킬 목록(skills.html), 스킬 상세(skill.html?id=…)에서 함께 사용합니다.
 * status — shared: 내려받아 쓰는 공유 스킬 / example: 설치 없이 쓰는 시작 예제 / planned: 제작 후보.
 * members — 만든 사람(공유 스킬) 또는 제작 참여자(제작 후보). 참여자 스킬은 origin에 제작자를 적습니다.
 * aliases — 예전 id. 제작 후보가 공유 스킬로 바뀌어도 skill.html?id=<예전 id> 링크가 이어집니다.
 * reason — 제작자가 밝힌 만든 이유(있을 때만). sampleOutput — 결과 예시 {label, text}(선택).
 * 공유 상태는 모든 모델에서 최종 검수했다는 뜻이 아닙니다.
 */
window.skillCatalog = [
  /* ---------- 1기 참여자가 만든 스킬 ---------- */
  {
    id: "case-to-project",
    aliases: ["marketing-research"],
    category: "marketing",
    categoryName: "광고·마케팅",
    icon: "megaphone",
    title: "흩어진 사례를 프로젝트로",
    description:
      "모아둔 링크·캡처·PDF·메모를 사례 카드와 문제 정의 초안으로 묶어, 첫 회의에서 바로 시작할 수 있는 발판 한 장을 만듭니다.",
    tags: ["사례 갈무리", "프로젝트 시작"],
    audience: "마케팅·광고·기획 프로젝트를 준비하는 학생 동아리와 소규모 팀",
    benefit:
      "사례를 쌓아 두기만 하던 팀이 문제 정의 초안과 첫 회의 안건까지 갖추고 프로젝트를 시작합니다. 사례를 새로 찾지는 않으며, 부족한 곳은 「더 찾을 것」 빈칸으로 남깁니다.",
    reason:
      "사례를 열심히 모아도 \"그래서 우리가 풀 문제가 뭔데?\"가 나오지 않아 첫 회의가 처음부터 다시 시작되는 문제에서 출발했습니다.",
    status: "shared",
    cohort: "1",
    members: ["김민영"],
    origin: "1기 참여자 김민영 제작",
    environment:
      "SKILL.md를 읽을 수 있는 환경이 필요합니다. 폴더를 읽고 파일을 저장하는 환경(Claude Code 등)을 기본으로 하고, 일반 채팅에서는 발판 전문을 채팅으로 받습니다. Claude Code의 서브에이전트에서 3개 시나리오로 확인했으며, 다른 도구와 모델에서의 동작은 확인하지 않았습니다.",
    path: "skills/marketing/case-to-project/SKILL.md",
    folder: "skills/marketing/case-to-project/",
    download: "downloads/case-to-project.zip",
    overview: [
      "팀이 여기저기 모아 둔 링크·캡처·PDF·메모를 받아 발판 한 장으로 정리합니다. 발판은 재료 목록, 사례 카드, 패턴, 문제 정의 초안 2~3안, 아이디어 씨앗, 더 찾을 것, 첫 회의 안건 3개의 일곱 칸입니다.",
      "사실은 재료에서만 가져옵니다. 열지 못한 링크나 읽히지 않는 캡처는 「확인 필요」로 남기고, 사례를 웹에서 새로 찾아 채우지 않습니다. 부족한 곳은 「더 찾을 것」에 검색어와 함께 적습니다.",
      "콘셉트·슬로건·실행안은 정하지 않습니다. 팀이 첫 회의에서 토론할 거리를 남기려는 설계입니다.",
    ],
    inputs: [
      "흩어진 사례 재료 · 링크, 캡처, PDF, 메모, 폴더 중 무엇이든",
      "선택 · 프로젝트 주제 한 줄 (없으면 재료에서 추정하고 「추정」으로 표시)",
      "선택 · 팀 규모와 상황 (예: 학생 동아리 4명)",
    ],
    files: [
      "SKILL.md — 절차와 지켜야 할 원칙",
      "assets/발판_양식.md — 발판 일곱 칸 양식",
      "references/예시_한라생태숲.md — 「확인 필요」를 남기는 법을 보여 주는 작성 예시",
    ],
    requirements: [
      "SKILL.md를 읽을 수 있는 환경. 일반 채팅에서는 내용을 붙여 넣고 자료를 첨부합니다.",
      "PDF·사진을 읽으려면 파일 첨부나 폴더 읽기를 지원하는 도구가 필요합니다. 읽지 못한 재료는 「확인 필요」로 남깁니다.",
    ],
    steps: [
      {
        title: "재료를 세어 목록으로 만듭니다",
        text: "링크·캡처·PDF·메모를 하나씩 세고 읽었는지 표시합니다. 주제가 없으면 재료에서 추정하고 「추정」이라고 붙입니다.",
      },
      {
        title: "눈에 띈 점 단위로 카드를 만듭니다",
        text: "출처, 무엇을 했나, 눈에 띈 점, 우리 과제와의 접점, 태그, 확인 필요를 한 장에 적습니다. 큰 PDF는 목차·요약·결론부터 읽습니다.",
      },
      {
        title: "패턴으로 묶고 문제 정의를 씁니다",
        text: "카드를 2~4개 패턴으로 묶고, 「누구의 · 어떤 문제를 · 왜 지금」 형식으로 2~3안을 근거 카드 번호와 함께 씁니다.",
      },
      {
        title: "씨앗과 빈칸을 정리합니다",
        text: "문제 정의마다 씨앗 1~2개를 적되 콘셉트로 확정하지 않습니다. 막힌 곳은 검색어와 함께 5개 안팎의 빈칸으로 남깁니다.",
      },
      {
        title: "첫 회의 안건 3개로 마무리합니다",
        text: "주제가 추정이면 1번 안건은 「주제 확정」입니다. 파일로 저장하고 채팅에는 카드 수·문제 정의 안 제목·안건만 요약합니다.",
      },
    ],
    usageExample:
      "첨부한 PDF와 캡처, 아래 메모로 case-to-project 스킬(SKILL.md) 지침에 따라 발판을 만들어줘.\n우리는 마케팅 동아리 4명이고 주제는 아직 못 정했어.\n모르는 건 지어내지 말고 확인 필요로 남겨줘.",
    verification:
      "같은 입력을 스킬 있음·없음으로 돌려 점검 34항목으로 채점했을 때 스킬 있음 34/34, 없음 12/34였습니다(2026-09-20, 3개 시나리오). 제출판(v1.3)은 시험용 메모 2종에서 12/13, 13/14였습니다.",
    results: ["case-to-project-memos", "case-to-project-no-topic"],
    notes: [
      "발판은 초안입니다. 「확인 필요」를 채우고 문제 정의를 고르는 일은 팀의 몫입니다.",
      "사례를 새로 찾아 주는 스킬이 아닙니다. 검색이 필요하면 별도로 요청합니다.",
      "기사·보고서는 요약과 출처만 남기고 통째로 옮기지 않습니다. 캡처 속 이름·연락처는 가립니다.",
      "작성 예시는 한 대학생 광고 동아리의 지난 프로젝트 기록으로 만들었으며 팀원 이름과 링크는 뺐습니다.",
      "공유 상태이며 최종 검수를 마친 것은 아닙니다. 모델과 도구에 따라 결과가 달라질 수 있습니다.",
    ],
  },
  {
    id: "quote-issue",
    category: "business",
    categoryName: "기업·스타트업",
    icon: "case",
    title: "견적서 발행과 매출 장부를 한 번에",
    description:
      "견적서 엑셀을 만들고, 견적서 발행대장과 매출소득관리 장부까지 한 번의 요청으로 채웁니다.",
    tags: ["XLSX", "Python·LibreOffice 필요"],
    audience: "견적서를 자주 내고 발행대장과 매출을 엑셀로 관리하는 소규모 기업 실무자",
    benefit:
      "견적서 작성, 대장 기입, 매출 장부 동기화를 따로 하던 일을 한 번에 끝냅니다. 장부의 외부 링크와 견적서의 로고·직인 이미지가 깨지지 않도록 전용 스크립트로 파일을 고칩니다.",
    status: "shared",
    cohort: "1",
    members: ["양근탁"],
    origin: "1기 참여자 양근탁 제작",
    environment:
      "Claude Code처럼 파일을 읽고 스크립트를 실행하는 환경이 필요합니다. Python 3과 openpyxl, 수식 재계산용 LibreOffice를 설치하며, 설치 안내는 Windows 경로 기준입니다. 평가 시나리오 3개가 함께 들어 있으며, 다른 도구와 모델에서의 동작은 확인하지 않았습니다.",
    path: "skills/business/quote-issue/SKILL.md",
    folder: "skills/business/quote-issue/",
    download: "downloads/quote-issue.zip",
    overview: [
      "새 견적서 생성 → 견적서발행대장 기입 → 매출소득관리 동기화를 한 번에 처리합니다. \"㈜테스트에 줄 견적서 만들어줘, 공급가액 500만원\"처럼 말하면 됩니다.",
      "견적번호는 발행대장에서 올해 마지막 번호를 찾아 다음 번호(견적YYYY-JNNN)로 매깁니다. 이미 만든 견적서를 대장에 올리기만 하거나, 손으로 고친 대장을 매출 장부에 다시 맞추는 일도 합니다.",
      "매출소득관리 장부는 발행대장을 외부 링크로 참조합니다. 일반 엑셀 라이브러리로 저장하면 링크 캐시와 이미지가 사라지기 때문에, 파일 내부를 직접 고치는 전용 스크립트 두 개를 씁니다.",
    ],
    inputs: [
      "받는 기업명, 견적명, 공급가액(VAT 별도)",
      "선택 · 견적내용 줄(최대 10줄), 견적일, 출장비",
      "작업 폴더 · 견적서발행대장.xlsx, 매출소득관리.xlsx (시작 세트 포함)",
    ],
    files: [
      "SKILL.md — 세 가지 작업 흐름과 주의사항",
      "README.md — 설치 안내",
      "assets/quote_template.xlsx — 견적서 양식 (공개용으로 회사 정보를 가림)",
      "scripts/fill_quote.py — 양식을 채워 새 견적서 생성",
      "scripts/register_quote.py — 발행대장 기입과 매출 장부 동기화",
      "references/file-structures.md — 두 장부의 열 구성과 외부 링크 동작",
      "evals/evals.json — 평가 시나리오 3개",
      "starter/견적예상매출/ — 빈 발행대장과 매출소득관리 장부",
    ],
    requirements: [
      "Python 3 · pip install openpyxl",
      "LibreOffice (수식 재계산)",
      "견적서 양식을 자기 회사 양식으로 교체 (셀 위치는 references 참고)",
    ],
    steps: [
      {
        title: "필요한 정보를 모읍니다",
        text: "대상·견적명·금액 중 빠진 것만 묻습니다. 금액이 VAT 포함인지 애매하면 확인합니다. 장부가 Excel로 열려 있으면 닫아 달라고 요청합니다.",
      },
      {
        title: "견적번호를 매깁니다",
        text: "발행대장에서 올해 견적번호 중 가장 큰 번호를 찾아 다음 번호를 씁니다. 사용자가 번호를 정하면 그 번호를 씁니다.",
      },
      {
        title: "견적서를 만듭니다",
        text: "fill_quote.py가 양식의 지정 셀만 바꿔 견적서_대상명.xlsx를 만들고, 값과 이미지가 그대로인지 검사합니다.",
      },
      {
        title: "발행대장과 매출 장부를 맞춥니다",
        text: "register_quote.py가 빈 행에 기입하고 부가세·합계와 매출소득관리의 링크 캐시를 갱신한 뒤 수식 오류를 검사합니다.",
      },
      {
        title: "결과를 표로 알려 줍니다",
        text: "견적서 경로, 발행대장 행 번호, 공급가액·부가세·합계를 정리합니다. 실패하면 오류를 숨기지 않고 원인과 함께 알립니다.",
      },
    ],
    usageExample:
      "㈜테스트에 줄 견적서 만들어줘.\n견적명은 'OO 시스템 v1.0', 공급가액 500만원.\n발행대장이랑 매출소득관리도 채워줘.",
    results: ["quote-issue-sample"],
    notes: [
      "공개용 양식은 회사명·주소·사업자번호·담당자 연락처를 ○ 표시로, 로고·직인을 자리표시 이미지로 바꾼 것입니다. 실제 직인 이미지가 든 양식은 공개 저장소에 올리지 마세요.",
      "입금일·입금액·인건비·자재비 열은 사용자가 직접 쓰는 칸이라 스크립트가 건드리지 않습니다.",
      "산출내역 칸이 시험성적서 발급 견적에 맞춰져 있습니다. 다른 업종은 양식과 스크립트의 셀 위치를 함께 고칩니다.",
    ],
  },
  {
    id: "vibe-spec",
    aliases: ["design-support"],
    category: "design-development",
    categoryName: "디자인·개발",
    icon: "code",
    title: "만들기 전에, 계획부터",
    description:
      "개발을 몰라도 쉬운 질문으로 요구사항을 정리하고, 단계별 계획 지도와 단계 시작 파일을 만들어 줍니다.",
    tags: ["바이브 코딩", "HTML 계획 지도"],
    audience: "개발 경험 없이 AI로 무언가를 만들어 보려는 사람, 바이브 코딩 입문자",
    benefit:
      "무엇을 만들지 정하지 않고 시작해 방향이 계속 바뀌는 일을 줄입니다. 단계마다 '내가 직접 확인할 것'이 있어 끝났는지 스스로 판단할 수 있습니다.",
    reason:
      "무엇을 만들지 정하지 않은 채 AI와 코딩을 시작해 방향이 계속 바뀌고, 끝났는지 스스로 판단하지 못하는 문제에서 출발했습니다.",
    status: "shared",
    cohort: "1",
    members: ["문혁재"],
    origin: "1기 참여자 문혁재 제작",
    environment:
      "Python 3 표준 라이브러리만 씁니다(추가 설치 없음). Claude 앱에서는 .skill 파일을 업로드하고, Claude Code에서는 폴더를 복사해 설치합니다. 다른 도구와 모델에서의 동작은 확인하지 않았습니다.",
    path: "skills/design-development/vibe-spec/SKILL.md",
    folder: "skills/design-development/vibe-spec/",
    download: "downloads/vibe-spec.zip",
    overview: [
      "1단계 요구사항 채우기. 빈칸 템플릿에서 비어 있는 칸만 한 번에 최대 3개씩, 전문용어 없이 묻습니다. '쓸 사람', '이게 되면 끝', '안 만들 것' 세 칸은 대신 정해 주지 않습니다.",
      "2단계 계획 그리기. 요구사항을 4~7단계로 나눠 브라우저로 여는 계획 지도(plan.html)와, 단계마다 새 대화에 올릴 시작 파일을 만듭니다. 단계 이름은 '백엔드 구축' 대신 '주문을 넣고 껐다 켜도 남아 있게 하기'처럼 씁니다.",
      "3단계 계획 고치기. 만드는 도중 바뀐 생각을 '못 알아들은 것 · 빠뜨린 것 · 새로 생긴 욕심 · 틀린 판단' 네 갈래로 나누고, 판(버전) 단위로 기록합니다. 범위가 늘어나면 경고합니다.",
    ],
    inputs: [
      "만들고 싶은 것에 대한 아이디어 한 줄",
      "선택 · 일부를 채운 요구사항 빈칸 템플릿(.md)",
      "개발 중이라면 · 계획 지도에서 모은 '바꾸고 싶은 것' 요청서",
    ],
    files: [
      "SKILL.md — 동작 규칙",
      "README.md — 사용설명서",
      "references/interview.md — 절별 질문 문장, 전문용어 바꿔 말하기, 기본값",
      "references/plan-rules.md — 단계 쪼개기 규칙과 plan.json 필드",
      "references/revising.md — 변경 네 갈래 분류 기준",
      "assets/requirements-template.md — 빈칸 요구사항 템플릿",
      "assets/stage-brief-template.md — 단계 시작 파일 틀",
      "assets/example-plan.json — 동네 반찬가게 주문받기 예시",
      "assets/plan-template.html — 계획 지도 원본",
      "scripts/spec_check.py · build_plan.py · revise_plan.py — 빈칸 검사, 계획 생성, 판 기록",
    ],
    requirements: ["Python 3 (표준 라이브러리만 사용)", "계획 지도를 열 브라우저"],
    steps: [
      {
        title: "요구사항 빈칸을 채웁니다",
        text: "spec_check.py가 빈칸을 줄 번호와 함께 찾고, 빈칸이 0개가 될 때까지 비어 있는 칸만 묻습니다. 모른다고 하면 흔한 기본값으로 채우고 알려 줍니다.",
      },
      {
        title: "꼭 있어야 하는 것을 3~5개로 줄입니다",
        text: "많으면 \"이 중 하나만 되고 나머지가 다 안 되면 그래도 쓰시겠어요?\"로 순위를 매기고, 나머지는 '있으면 좋은 것'으로 내립니다.",
      },
      {
        title: "계획 지도를 그립니다",
        text: "build_plan.py가 plan.html과 단계 시작 파일을 만듭니다. 계획 지도에는 단계별 체크 상자, 진행률, '여기까지가 1차 출시' 선이 있습니다.",
      },
      {
        title: "단계별로 만듭니다",
        text: "시작 파일을 새 대화에 올리고 \"이 파일대로 시작해 줘\"라고만 말합니다. 파일마다 할 일, 직접 확인할 것, 지키기로 한 것이 같은 순서로 들어 있습니다.",
      },
      {
        title: "바뀐 생각을 판으로 기록합니다",
        text: "revise_plan.py가 두 판을 비교해 무엇이 바뀌었는지 기록합니다. 새로 생긴 욕심은 기본적으로 뒤로 미룹니다.",
      },
    ],
    usageExample:
      "동네 반찬가게 주문을 링크로 받는 페이지를 만들고 싶어.\nvibe-spec 스킬로 뭘 만들지부터 같이 정해줘.\n나는 개발을 해 본 적이 없어.",
    results: ["vibe-plan"],
    notes: [
      "요구사항이 이미 확정되어 코드를 짜는 중이라면 이 스킬이 맞지 않습니다.",
      "계획 지도의 체크 상태와 '바꾸고 싶은 것' 메모는 그 브라우저에만 저장됩니다.",
      "build_plan.py는 API 키처럼 보이는 문자열을 ***로 가립니다.",
      "사용설명서에 나오는 기록용 dev-replay 스킬은 이 저장소에 없습니다.",
    ],
  },
  {
    id: "quote-to-pumui",
    category: "education",
    categoryName: "교육",
    icon: "book",
    title: "견적서에서 품의까지",
    description:
      "학교 견적서 엑셀을 넣으면 에듀파인 품의용 머릿공문과 품목내역 업로드 파일을 만듭니다.",
    tags: ["에듀파인", "XLS"],
    audience: "견적서를 받아 에듀파인으로 품의를 올리는 초·중·고 교사와 행정 실무자",
    benefit:
      "견적서 품목을 품의 화면에 한 줄씩 옮겨 적던 일을 업로드 파일 하나로 줄이고, 수량×단가 합계가 견적금액과 맞는지 검증합니다.",
    status: "shared",
    cohort: "1",
    members: ["한민철"],
    origin: "1기 참여자 한민철 제작",
    environment:
      "SKILL.md에 들어 있는 Python 스크립트를 저장해 실행합니다. Python 3, openpyxl, LibreOffice(soffice)가 필요해 코드 실행이 되는 환경에서 씁니다. 다른 도구와 모델에서의 동작은 확인하지 않았습니다.",
    path: "skills/education/quote-to-pumui/SKILL.md",
    folder: "skills/education/quote-to-pumui/",
    download: "downloads/quote-to-pumui.zip",
    overview: [
      "견적서(.xlsx·.xls)에서 학교명·견적금액·품목 표를 찾고, \"어떤 돈을 지출하시나요?\"를 한 번만 물은 뒤 두 가지를 만듭니다.",
      "하나는 바로 복사해 붙이는 머릿공문입니다. 학년도, 사업명, '첫 품목 외 n종', 총액이 자동으로 들어갑니다. 1~2월 견적서는 전년도 학년도로 처리합니다.",
      "다른 하나는 에듀파인 품의 화면에서 일괄 업로드하는 품목내역 파일(.xls)입니다. 열은 내용 | 규격 | 단위 | 수량 | 예상단가이며, 규격이 없는 도서는 '저자 / 출판사', 단위가 없으면 도서는 '권', 그 외는 '개'로 채웁니다.",
    ],
    inputs: [
      "학교 견적서 파일(.xlsx 또는 .xls)",
      "지출 목적 한 줄 (예: 전문적학습공동체 운영도서 구입)",
      "선택 · 학교의 품의내역 양식",
    ],
    files: [
      "SKILL.md — 절차, 공문 형식, 변환 스크립트(quote2pumui.py) 포함",
      "README.md — 제작자의 스킬 설명",
    ],
    requirements: ["Python 3 · pip install openpyxl", "LibreOffice (xls 읽기·쓰기, 수식 재계산)"],
    steps: [
      {
        title: "견적서를 읽습니다",
        text: "\"○○학교 귀중\"에서 학교명, \"견적금액\"에서 총액, 그 아래 품목 표를 가져옵니다. 시트가 여러 개면 합계가 견적금액과 맞는 시트를 고릅니다.",
      },
      {
        title: "지출 목적을 한 번 묻습니다",
        text: "\"전학공 책 사요\"처럼 답하면 \"전문적학습공동체 운영도서 구입\"처럼 공문체로 다듬고, 다듬은 표현을 보여 줍니다.",
      },
      {
        title: "품목내역 업로드 파일을 만듭니다",
        text: "합계·소계 행과 빈 행은 빼고, 품목은 견적서 줄 그대로 옮깁니다. 금액이 수식이어도 계산된 값을 가져옵니다.",
      },
      {
        title: "머릿공문을 씁니다",
        text: "제목과 본문을 코드 블록으로 보여 줘 바로 복사할 수 있게 합니다.",
      },
      {
        title: "합계를 검증합니다",
        text: "수량×단가를 더한 값이 견적금액과 맞는지 확인하고, 다르면 두 금액을 모두 알려 줍니다.",
      },
    ],
    usageExample: "첨부한 견적서로 품의 작성해줘.\n전문적학습공동체 운영도서 구입이야.",
    sampleOutput: {
      label: "머릿공문 예시 (제작자 설명서)",
      text: "제목: 2026학년도 전문적학습공동체 운영도서 구입\n\n1. 관련: 2026학년도 ○○초등학교 교육계획(교육과정)\n\n2. 2026학년도 전문적학습공동체 운영도서 구입 관련 아래와 같이 지출하겠습니다.\n  가. 품목: AI 격차 외 23종\n  나. 금액: 480,000원.  끝.",
    },
    notes: [
      "공문의 관련 근거와 문구는 학교 관행에 맞는지 확인한 뒤 올립니다.",
      "학교 품의내역 양식의 머리글·시트명이 기본과 다르면 스크립트의 write_xls를 그 양식에 맞춥니다.",
    ],
  },
  {
    id: "pyeongga-gyehoek-hwpx",
    category: "education",
    categoryName: "교육",
    icon: "book",
    title: "평가계획을 한글 파일로",
    description:
      "성취기준과 평가요소를 주면 2022 개정 교육과정에 맞춘 교수·학습 및 평가계획 표를 한글(.hwpx) 파일로 만듭니다.",
    tags: ["HWPX", "2022 개정 교육과정"],
    audience: "교수·학습 및 평가계획을 작성하는 초등 교사",
    benefit:
      "성취수준 상·중·하 문장을 교육부 성취수준 자료(A·B·C)에 맞춰 채우고, 학교 양식의 표를 그대로 한글 파일로 만듭니다.",
    status: "shared",
    cohort: "1",
    members: ["한민철"],
    origin: "1기 참여자 한민철 제작",
    environment:
      "제작자의 Claude 아티팩트에 보관된 양식·생성기·성취수준표 묶음을 내려받아 씁니다. 이 묶음은 저장소에 들어 있지 않아, 아티팩트를 읽을 수 없는 환경에서는 실행할 수 없습니다. 코드 실행 환경과 Python 3이 필요합니다.",
    path: "skills/education/pyeongga-gyehoek-hwpx/SKILL.md",
    folder: "skills/education/pyeongga-gyehoek-hwpx/",
    download: "downloads/pyeongga-gyehoek-hwpx.zip",
    overview: [
      "평가요소 1개마다 상·중·하 3줄로 된 표 한 묶음을 만듭니다. 열은 영역 | 단원명(교수·학습 내용) | 평가 요소 | 평가 방법 | 성취기준 | 성취수준(상·중·하) | 평가 시기입니다. 초등 1~6학년 모든 학년군을 지원합니다.",
      "성취수준은 교육부 '성취기준별 성취수준' 자료의 A·B·C를 기준으로 씁니다. 1~2학년군 100개, 3~4학년군 231개, 5~6학년군 277개 성취기준이 표로 들어 있고, 필요한 한 줄만 찾아 씁니다.",
      "표에 없는 성취기준은 에듀넷 성취수준 자료실에서 그 코드만 찾아오고, 거기서도 없으면 공식 자료의 문체를 본떠 쓴 뒤 그렇게 했다고 알립니다. 2015 개정 교육과정 용어는 섞지 않습니다.",
    ],
    inputs: [
      "성취기준 (코드만 적어도 됨)",
      "평가요소",
      "선택 · 학년·학기, 단원명, 평가 방법, 평가 시기",
    ],
    files: [
      "SKILL.md — 절차와 내용 규칙",
      "README.md — 제작자의 스킬 설명",
      "별도 보관 · 빈 양식, make_plan.py, 성취수준표 3개 (제작자 아티팩트, 저장소 미포함)",
    ],
    requirements: [
      "코드 실행 환경과 Python 3",
      "양식·생성기 묶음을 읽을 수 있는 환경",
      "결과 확인용 한컴오피스 한글",
    ],
    steps: [
      {
        title: "양식과 성취수준표를 내려받습니다",
        text: "묶음 파일을 내려받기만 하고 본문은 읽지 않습니다. 성취수준표에서도 필요한 성취기준 한 줄만 찾습니다.",
      },
      {
        title: "빠진 정보를 확인합니다",
        text: "학년·학기가 코드로 정해지지 않으면 한 번에 묶어 묻습니다. 평가 시기를 모르면 '◯월'로 비워 둡니다.",
      },
      {
        title: "표 내용을 채웁니다",
        text: "영역·단원명은 성취수준 자료에서, 평가 방법은 과정 중심 평가 위주로 1~2개를 고릅니다. 평가요소가 성취기준의 일부면 그 부분에 맞게 다듬습니다.",
      },
      {
        title: "한글 파일을 만듭니다",
        text: "○학년_○학기_교과_교수학습및평가계획.hwpx 이름으로 만들고 파일 구조를 검사합니다.",
      },
      {
        title: "추정한 부분을 알려 줍니다",
        text: "새로 지은 단원명, '◯월', 표에 없어 에듀넷에서 가져오거나 직접 쓴 성취수준을 한두 줄로 알립니다.",
      },
    ],
    usageExample:
      "[6과01-03] 화석의 생성 과정을 ... (성취기준)\n지구의 과거 생물과 환경 추리하기 (평가요소)\n평가계획 만들어줘.",
    notes: [
      "새로 지어 넣은 단원명은 교과서 단원명에 맞게 고칩니다.",
      "만든 파일은 한글에서 열어 평가 시기 등 학교 계획에 맞는지 마지막으로 확인합니다.",
      "학교 양식이 바뀌면 새 빈 양식(.hwpx)을 주어 그 양식에 맞게 바꿀 수 있습니다.",
    ],
  },
  /* ---------- 1기 시작 시점에 제공된 스킬과 공통 예제 ---------- */
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
