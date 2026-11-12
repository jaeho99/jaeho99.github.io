# 재호의 백엔드 개발 기록

실무에서 마주한 문제를 분석하고 해결 과정을 기록하는 Astro 기반 공식 블로그입니다.

- 공식 원문: <https://jaeho99.github.io>
- 재현 코드와 변경 이력: 이 GitHub 저장소
- 요약·공유 채널: <https://velog.io/@dev_resolution>

## 로컬 실행

```bash
npm install
npm run dev
```

## 수정할 기본 정보

- `src/data/site.ts`: 작성자, GitHub, 이메일
- `astro.config.mjs`: 최종 공개 주소
- `src/content/blog/`: Markdown 게시글
- `src/pages/categories/`: 카테고리 목록과 카테고리별 글 목록
- `src/pages/roadmap.astro`: 콘텐츠 로드맵
- `examples/`: 글에서 사용하는 독립 재현 예제
- `docs/writing-guide.md`: 작성 및 공개 원칙

게시글 frontmatter에는 대표 `category` 하나와 세부 `tags`를 지정합니다.

```yaml
category: "Java · Spring"
tags: ["Spring MVC", "Ajax", "Java"]
```

현재 설정은 다음과 같습니다.

- GitHub 사용자명: `jaeho99`
- 저장소 이름: `jaeho99.github.io`
- 기본 공개 주소: `https://jaeho99.github.io`
- 공식 저장소: `jaeho99/jaeho99.github.io`

## 개인 도메인

개인 도메인을 정한 뒤 `public/CNAME` 파일을 만들고 도메인 하나만 입력하세요.
