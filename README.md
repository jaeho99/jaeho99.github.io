# 재야호의 개발 기록

문제를 분석하고 해결하는 과정을 기록하는 Astro 기반 개발 블로그입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 수정할 기본 정보

- `src/data/site.ts`: 작성자, GitHub, 이메일
- `astro.config.mjs`: 최종 공개 주소
- `src/content/blog/`: Markdown 게시글

현재 권장 설정은 다음과 같습니다.

- GitHub 사용자명: `jaeho99`
- 저장소 이름: `jaeho99.github.io`
- 기본 공개 주소: `https://jaeho99.github.io`
- 개인 도메인 후보: `jaeyaho.dev` 또는 `jaeyaho.kr`

## 개인 도메인

개인 도메인을 정한 뒤 `public/CNAME` 파일을 만들고 도메인 하나만 입력하세요.
