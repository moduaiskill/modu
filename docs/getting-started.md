# 스킬 사용하기

스킬은 AI에게 전달할 업무 방법을 묶은 폴더입니다. 중심 파일은 `SKILL.md`이며 참고 문서나 양식이 함께 들어 있을 수 있습니다.

## 1. 필요한 폴더 받기

[전체 ZIP](https://github.com/moduaiskill/modu/archive/refs/heads/main.zip)을 내려받아 압축을 풀거나 저장소를 복제합니다. 처음에는 `skills/common/meeting-notes/` 예제로 시작하세요. 이 예제는 `SKILL.md` 하나로 사용할 수 있습니다.

설치할 폴더는 `common/`이 아니라 그 안의 `meeting-notes/`입니다. 참고자료가 포함된 스킬은 개별 폴더 전체를 함께 복사합니다.

공유된 스킬을 바로 받으려면 [입찰 제안서 ZIP](../downloads/public-bid-proposal.zip)과 [HWPX 변환 ZIP](../downloads/md-to-hwpx.zip)을 사용하세요. 압축을 풀면 스킬명 폴더 안에 `SKILL.md`와 실행에 필요한 파일이 함께 있습니다. 아래 설치 예시의 `meeting-notes`를 선택한 스킬명으로 바꿉니다.

- 입찰 제안서는 공고문과 기관 정보가 필요합니다. HTML 작성은 지침과 양식으로 진행하며, PDF나 이미지 자동화는 스크립트별 도구가 필요합니다.
- HWPX 변환에는 Python과 `markdown`, `beautifulsoup4` 패키지가 필요합니다. `SKILL.md`에 변환 명령을 안내합니다.

## 2. 나의 환경에 연결하기

### ChatGPT·Claude 일반 채팅에서 지침으로 사용

`SKILL.md`를 텍스트 편집기로 열고 내용을 새 대화에 붙여 넣은 뒤 아래와 같이 요청합니다. 파일 첨부를 지원하는 환경에서는 파일과 필요한 참고자료를 첨부해도 됩니다.

```text
아래 스킬 지침에 따라 이어서 제공할 회의 메모를 정리해줘.
결정 사항과 후속 할 일을 구분하고, 없는 담당자나 기한은 만들어 내지 마.

[SKILL.md 내용]

[회의 메모]
```

이는 채팅에 지침을 전달하는 방법이며 네이티브 스킬 설치와는 다릅니다. 폴더 안의 자료를 자동으로 읽는다고 가정하지 말고 필요한 자료를 함께 전달합니다. 스크립트나 외부 서비스는 사용 환경에서 지원해야 실행할 수 있습니다.

### Claude Code에서 폴더로 설치

프로젝트의 `.claude/skills/meeting-notes/`에 예제 폴더를 복사합니다.

```text
내-프로젝트/
└── .claude/skills/meeting-notes/SKILL.md
```

`/meeting-notes`와 함께 회의 메모를 전달합니다. 설명에 맞는 요청으로 자동 선택되게 할 수도 있습니다. 모든 프로젝트에서 쓰려면 개인 폴더 `~/.claude/skills/`를 사용합니다.

출처 — [Claude Code 공식 스킬 문서](https://code.claude.com/docs/en/skills).

### Codex에서 폴더로 설치

프로젝트의 `.agents/skills/meeting-notes/`에 예제 폴더를 복사합니다.

```text
내-프로젝트/
└── .agents/skills/meeting-notes/SKILL.md
```

`$meeting-notes`와 함께 회의 메모를 전달합니다. 개인 전체 프로젝트용 위치는 `~/.agents/skills/`입니다. 설치 후 목록에 나타나지 않으면 Codex를 다시 시작해 확인합니다.

출처 — [OpenAI 공식 스킬 문서](https://learn.chatgpt.com/docs/build-skills).

## 3. 결과 확인하기

[가상 회의 예제](example-meeting.md)로 결정 사항, 미정 항목, 담당자와 기한이 원문대로 분리되는지 확인합니다. 모델과 도구에 따라 결과가 달라질 수 있습니다.

공유 파일은 무료입니다. AI 서비스의 요금과 도구 지원 범위는 별개입니다. 설치 경로는 2026년 9월 13일 확인한 공식 문서를 기준으로 합니다.
