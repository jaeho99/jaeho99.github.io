# Ajax JSON/JSP 비교 예제

Spring MVC 컨트롤러의 반환값이 JSP 렌더링과 JSON 본문 직렬화 중 어느 경로로 처리되는지 비교하는 최소 WAR 예제입니다.

## 환경

- Java 8
- Spring MVC 5.3.39
- Jackson 2.17.2
- jQuery 3.7.1
- Servlet 4.0 / Tomcat 9 계열

## 확인할 엔드포인트

| 경로 | 의도 | 예상 결과 |
| --- | --- | --- |
| `/demo/broken` | 논리 뷰 이름 반환 | `result.jsp` HTML |
| `/demo/body` | `@ResponseBody` | JSON |
| `/demo/named-view` | 이름 기반 JSON View | JSON |
| `/demo/direct-view` | JSON View 직접 지정 | JSON |

## 실행

```bash
mvn test
mvn package
```

생성된 `target/ajax-json-vs-jsp.war`를 Tomcat 9에 배포한 뒤 `/ajax-json-vs-jsp/`에 접속합니다.

> 저장소 통합 시점에는 테스트와 브라우저 실행을 완료하지 않았습니다. 실행 후 환경과 결과를 글의 검증 상태에 반영해야 합니다.

