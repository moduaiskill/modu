# SNS 공유 이미지

홈페이지의 크림색·오렌지색과 스킬 폴더 모티프를 바탕으로 내장 image_gen 도구로 제작했습니다. 한글 문구와 배치를 육안 확인했으며, 생성 원본 해상도를 보존했습니다.

| 파일 | 실제 크기 | 용도 |
| --- | --- | --- |
| [modu-ai-skill-og.png](modu-ai-skill-og.png) | 1730 × 909 | 홈페이지 링크 미리보기, 가로형 공유 게시물 |
| [modu-ai-skill-square.png](modu-ai-skill-square.png) | 1254 × 1254 | 정사각형 SNS 게시물 |

가로형 이미지는 루트 `index.html`의 Open Graph와 Twitter 카드에 연결되어 있습니다. 저장소에 이미지와 HTML을 함께 반영하고 Pages 배포가 성공해야 외부에서 접근할 수 있습니다. 기본 주소는 `https://moduaiskill.github.io/modu/`이며, 다른 주소로 배포할 경우 메타 태그의 절대 주소를 변경합니다.

정사각형 이미지는 게시물 작성 시 직접 첨부합니다. 생성에 사용한 전체 프롬프트는 [prompts.md](prompts.md)에 보관했습니다.

게시글 문안:

> 한 사람의 노하우가, 모두의 스킬이 되도록.
>
> 매번 설명하던 내 업무, 이제 스킬 하나로. 함께 만들고 누구나 무료로 사용하는 AI 업무 스킬을 만나보세요.
>
> https://moduaiskill.github.io/modu/
>
> #모두의AISkill #모두의AX도구함 #AI업무활용 #업무자동화
