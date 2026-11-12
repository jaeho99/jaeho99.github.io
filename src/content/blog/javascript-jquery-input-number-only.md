---
title: 'JavaScript·jQuery input 숫자만 입력받기: 정규식, 이벤트 위임, 한글 IME'
description: 'maxlength만으로 해결되지 않는 숫자 입력을 paste, 동적 요소, 한글 IME까지 고려해 설계합니다.'
pubDate: 2026-11-11
tags: ['JavaScript', 'jQuery', 'Validation']
draft: false
---

> 검증 상태: 문자열 정규화와 Java 정규식은 간단한 입력값으로 확인했습니다. 실제 브라우저별 IME 조합, JSP/Spring 연동까지는 통합 시점에 검증하지 않았습니다.

## 요구사항

6자리 숫자 코드를 입력받는 필드를 생각해 봅시다.

- 숫자만 허용한다.
- 최대 6자리다.
- 붙여넣기에도 같은 규칙을 적용한다.
- 화면에 동적으로 추가된 입력에도 동작한다.
- 한글 IME 조합 중 입력을 섣불리 훼손하지 않는다.
- 서버에서도 같은 규칙을 다시 검증한다.

`maxlength="6"`은 길이만 제한할 뿐 숫자 여부를 보장하지 않습니다. `type="number"`도 브라우저와 지역 설정에 따라 `e`, 부호, 소수점 같은 입력을 허용할 수 있어 식별자 입력에는 기대와 다를 수 있습니다.

## 입력값을 정규화하는 작은 함수

```javascript
function normalizeDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
```

허용되지 않은 키를 모두 막는 것보다, 입력된 문자열에서 숫자가 아닌 문자를 제거하는 방식이 키보드 입력과 붙여넣기를 같은 규칙으로 처리하기 쉽습니다.

HTML에는 모바일 키패드를 유도하는 힌트를 함께 줄 수 있습니다.

```html
<input
  class="js-digits-only"
  type="text"
  inputmode="numeric"
  pattern="[0-9]*"
  maxlength="6"
  data-maxlength="6"
  autocomplete="one-time-code"
>
```

`inputmode`와 `pattern`은 사용자 경험을 돕지만 보안 경계가 아닙니다.

## 동적 요소에는 이벤트 위임

```javascript
$(document).on('input', '.js-digits-only', function () {
  if (this.dataset.composing === 'true') return;

  var maxLength = Number(this.dataset.maxlength || 6);
  var normalized = normalizeDigits(this.value, maxLength);
  if (this.value !== normalized) this.value = normalized;
});
```

이벤트 리스너를 `document`에 위임하면 코드 실행 뒤 추가된 입력 요소도 같은 규칙을 사용합니다. 범위가 넓은 페이지에서는 `document` 대신 폼이나 컴포넌트 루트를 위임 대상으로 삼는 편이 좋습니다.

## 한글 IME 조합 처리

한글이나 일본어 입력은 여러 키 입력이 하나의 문자로 확정되는 조합 과정을 거칩니다. 조합 중간에 값을 계속 바꾸면 글자가 깨지거나 커서가 튈 수 있습니다.

```javascript
$(document)
  .on('compositionstart', '.js-digits-only', function () {
    this.dataset.composing = 'true';
  })
  .on('compositionend', '.js-digits-only', function () {
    this.dataset.composing = 'false';
    $(this).trigger('input');
  });
```

조합 중에는 정규화를 미루고 `compositionend` 뒤 한 번 적용합니다. 실제 서비스에서는 지원 브라우저와 운영체제 조합으로 직접 확인해야 합니다.

## 서버 검증은 반드시 다시 한다

클라이언트 코드는 사용자가 우회할 수 있으므로 서버에서 같은 조건을 검증해야 합니다.

```java
public boolean isValidCode(String value) {
    return value != null && value.matches("^[0-9]{1,6}$");
}
```

정확히 6자리여야 한다면 `{6}`을 사용합니다. 값이 주문번호나 인증코드처럼 계산 대상이 아니라면 숫자형보다 문자열로 다루는 편이 앞자리 0을 보존하기 쉽습니다.

## 체크리스트

- 숫자 키와 비숫자 키
- 마우스·키보드 붙여넣기
- 6자리를 넘는 값
- 앞자리가 0인 값
- 동적으로 추가한 필드
- 한글 IME 조합 시작과 종료
- 모바일 키패드
- JavaScript를 우회한 서버 요청

입력 제한은 한 줄 정규식보다 입력 방식, 접근성, 서버 검증을 함께 설계하는 문제입니다. 프런트엔드는 빠른 피드백을 제공하고, 서버는 데이터의 최종 유효성을 책임지는 식으로 역할을 분리하면 됩니다.

