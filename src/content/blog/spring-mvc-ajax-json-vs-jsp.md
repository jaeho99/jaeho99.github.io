---
title: 'Spring MVC에서 Ajax 요청 시 JSON 대신 JSP가 반환되는 이유'
description: 'jQuery dataType을 json으로 지정했는데 HTML이 돌아오는 현상을 Spring MVC의 반환값 처리 흐름으로 분석합니다.'
pubDate: 2026-11-12
category: 'Java · Spring'
tags: ['Spring MVC', 'Ajax', 'Java']
draft: false
---

> 검증 상태: 컨트롤러 흐름과 MockMvc 테스트 코드를 작성했습니다. 이 글을 통합한 시점에는 Maven, Tomcat, 실제 브라우저 실행 결과까지 확인하지 않았습니다.

## 문제 상황

jQuery Ajax 호출에서 `dataType: 'json'`을 지정했는데 `success`가 아니라 `error`가 호출되고, 응답 본문에는 JSON 대신 완성된 HTML이 들어오는 경우가 있습니다.

```javascript
$.ajax({
  url: '/demo/broken',
  method: 'GET',
  dataType: 'json'
}).done(function (data) {
  console.log(data);
}).fail(function (xhr, textStatus, errorThrown) {
  console.log(textStatus, errorThrown, xhr.responseText);
});
```

이때 `dataType`은 서버에게 JSON을 만들라고 지시하는 설정이 아닙니다. 클라이언트가 받은 응답을 JSON으로 해석하겠다는 뜻입니다. 서버가 HTML을 반환하면 HTTP 상태가 200이어도 JSON 파싱 단계에서 `parsererror`가 발생할 수 있습니다.

## 원인: 반환값이 선택하는 두 경로

Spring MVC 컨트롤러의 반환값은 크게 두 경로를 탑니다.

1. 논리 뷰 이름을 반환하면 `ViewResolver`가 JSP 같은 화면을 찾고 렌더링합니다.
2. `@ResponseBody`를 사용하면 `HttpMessageConverter`가 객체를 응답 본문에 직렬화합니다.

다음 메서드의 문자열 `result`는 JSON 데이터가 아니라 논리 뷰 이름입니다.

```java
@GetMapping("/demo/broken")
public String broken(Model model) {
    model.addAttribute("message", "hello");
    return "result";
}
```

`InternalResourceViewResolver`의 접두사와 접미사가 각각 `/WEB-INF/views/`, `.jsp`라면 `/WEB-INF/views/result.jsp`가 렌더링됩니다. 요청이 Ajax인지 여부는 이 흐름을 자동으로 JSON 경로로 바꾸지 않습니다.

## 해결 1: `@ResponseBody`

일반적인 REST 응답이라면 가장 명확한 방법입니다.

```java
@GetMapping(value = "/demo/body", produces = "application/json")
@ResponseBody
public Map<String, Object> body() {
    Map<String, Object> data = new LinkedHashMap<String, Object>();
    data.put("message", "hello");
    return data;
}
```

Jackson이 클래스패스에 있으면 `Map`은 JSON 응답 본문으로 변환됩니다. 컨트롤러 전체가 API 역할을 한다면 `@RestController`도 선택할 수 있습니다.

## 해결 2: 이름 기반 JSON View

레거시 설정에서 기존 View 구조를 유지해야 한다면 `MappingJackson2JsonView`를 빈으로 등록할 수 있습니다.

```java
@Bean
public MappingJackson2JsonView jsonView() {
    return new MappingJackson2JsonView();
}

@Bean
public BeanNameViewResolver beanNameViewResolver() {
    BeanNameViewResolver resolver = new BeanNameViewResolver();
    resolver.setOrder(0);
    return resolver;
}
```

```java
@GetMapping("/demo/named-view")
public ModelAndView namedView() {
    return new ModelAndView("jsonView", payload());
}
```

이 방식은 `BeanNameViewResolver`와 우선순위 설정에 의존합니다. 구성 요소가 많아지므로 새 코드에서는 `@ResponseBody`보다 의도가 덜 직접적일 수 있습니다.

## 해결 3: JSON View 직접 지정

```java
@GetMapping("/demo/direct-view")
public ModelAndView directView() {
    return new ModelAndView(new MappingJackson2JsonView(), payload());
}
```

View 객체를 직접 넘기면 이름 기반 탐색은 피할 수 있지만, 컨트롤러가 구체적인 View 구현을 알게 됩니다.

## 무엇을 확인해야 하나

브라우저 Network 탭에서 다음을 함께 확인해야 합니다.

- HTTP 상태와 `Content-Type`
- 실제 응답 본문이 HTML인지 JSON인지
- jQuery의 `textStatus`와 `errorThrown`
- 서버 로그에서 선택된 컨트롤러와 View

작성한 MockMvc 테스트는 오류 재현 엔드포인트가 JSP로 포워딩되는지, 세 가지 해결 엔드포인트가 같은 JSON 구조를 반환하는지를 확인하도록 구성했습니다. 실행 가능한 전체 예제는 [GitHub의 재현 코드](https://github.com/jaeho99/jaeho99.github.io/tree/main/examples/ajax-json-vs-jsp)에 정리했습니다.

## 정리

`dataType: 'json'`은 서버 응답 형식을 결정하지 않습니다. JSON이 필요하다면 서버 컨트롤러가 응답 본문 직렬화 경로 또는 JSON View를 명시적으로 선택해야 합니다. 문제를 볼 때는 “Ajax인데 왜 화면이 왔지?”보다 “이 반환값이 View 렌더링과 본문 직렬화 중 어느 경로로 처리됐지?”라고 질문하는 편이 원인에 더 빨리 도달합니다.

