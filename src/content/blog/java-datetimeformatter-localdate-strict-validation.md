---
title: 'Java DateTimeFormatter 사용법과 날짜 유효성 검사: LocalDate와 STRICT'
description: 'YYMMDD 문자열을 실제 날짜로 검증하고 기간 순서를 확인한 뒤 MyBatis와 Oracle 검색 조건에 안전하게 전달하는 방법을 정리합니다.'
pubDate: 2026-11-12
category: 'Java · Spring'
tags: ['Java 8', 'DateTimeFormatter', 'LocalDate', 'MyBatis', 'Oracle']
draft: false
---

JSP, jQuery, Java 8, MyBatis와 Oracle을 사용하는 게시판에서 기간 검색 기능을 구현했다. 사용자는 시작일과 종료일을 `YYMMDD` 형식으로 입력하고 둘 중 하나만 입력해도 검색할 수 있어야 했다.

```text
시작일: 261101
종료일: 261106
```

처음에는 숫자 여섯 자리만 검사하면 충분하다고 생각했다.

```java
if (!value.matches("\\d{6}")) {
    throw new IllegalArgumentException(
        "날짜는 숫자 6자리로 입력해주세요."
    );
}
```

하지만 `261132`와 `260230`도 숫자 여섯 자리이므로 정규식을 통과한다. 문자열 형식이 맞는 것과 실제 날짜가 존재하는지는 서로 다른 문제다.

이 글에서는 `DateTimeFormatter`, `LocalDate`와 `ResolverStyle.STRICT`를 이용해 입력 형식과 실제 날짜를 함께 검증하고, 기간 검색과 Oracle 조건에 연결하는 방법을 정리한다.

## 1. DateTimeFormatter란

`DateTimeFormatter`는 Java 8의 `java.time.format` 패키지에서 날짜·시간의 출력과 파싱 형식을 정의하는 클래스다.

- 날짜 객체를 문자열로 출력한다.
- 문자열을 날짜 객체로 파싱한다.
- 날짜를 해석하는 엄격도를 지정한다.

```java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateExample {
    public static void main(String[] args) {
        LocalDate date = LocalDate.of(2026, 11, 6);

        DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("uuuu-MM-dd");

        String result = date.format(formatter);
        System.out.println(result);
    }
}
```

```text
2026-11-06
```

`LocalDate`는 시간과 시간대가 없는 연·월·일을 나타낸다. `DateTimeFormatter`는 불변이고 스레드 안전하므로 상수로 만들어 재사용할 수 있다.

## 2. 날짜 패턴에서 자주 혼동하는 문자

| 패턴 | 의미 | 예시 |
| --- | --- | --- |
| `uuuu` | 연대와 독립적인 연도 | 2026 |
| `yyyy` | 연대 기준 연도 | 2026 |
| `uu` | 두 자리 축약 연도 | 26 |
| `MM` | 월 | 11 |
| `dd` | 일 | 06 |
| `HH` | 24시간제 시 | 15 |
| `mm` | 분 | 30 |
| `ss` | 초 | 45 |

`MM`은 월이고 `mm`은 분이다. 대문자 `YYYY`는 주 기반 연도이므로 일반적인 연·월·일 날짜에는 `uuuu` 또는 요구사항에 맞는 `yyyy`를 사용한다.

엄격한 ISO 날짜 파싱에서는 `u`가 단순하다. `y`는 year-of-era이므로 연대 정보와 함께 해석되는 필드이고, `u`는 연대와 독립적인 연도 필드다.

## 3. 문자열을 LocalDate로 파싱하기

```java
String input = "261106";

DateTimeFormatter formatter =
    DateTimeFormatter.ofPattern("uuMMdd");

LocalDate date = LocalDate.parse(input, formatter);
System.out.println(date);
```

```text
2026-11-06
```

두 자리 `uu`는 축약 연도로 처리된다. `DateTimeFormatter`의 패턴 규칙에서는 두 자리 연도를 2000을 기준으로 줄여 읽으므로 `00`부터 `99`가 2000년부터 2099년으로 해석된다.

이 범위가 업무 규칙과 맞는지 확인해야 한다. 생년월일처럼 1900년대와 2000년대를 함께 다룬다면 두 자리 연도만으로 세기를 확정할 수 없으므로 네 자리 연도를 받거나 별도의 기준을 정의해야 한다.

## 4. 정규식만으로 날짜를 검증할 수 없는 이유

```java
value.matches("\\d{6}")
```

이 검사는 길이와 문자 구성만 확인한다.

| 입력값 | 정규식 | 실제 날짜 |
| --- | --- | --- |
| `261106` | 통과 | 정상 |
| `261132` | 통과 | 존재하지 않음 |
| `260230` | 통과 | 존재하지 않음 |
| `2611AA` | 실패 | 잘못된 형식 |
| `2611` | 실패 | 잘못된 형식 |

따라서 검증을 두 단계로 나눈다.

1. 정규식으로 숫자 여섯 자리인지 확인한다.
2. `LocalDate.parse`로 달력에 존재하는 날짜인지 확인한다.

## 5. ResolverStyle.STRICT

`ResolverStyle`은 파싱된 연·월·일 필드를 날짜로 해석하는 방법을 결정한다.

| 종류 | 특징 |
| --- | --- |
| `STRICT` | 해당 연·월에 실제로 존재하지 않는 일을 거부한다. |
| `SMART` | 필드별 합리적인 기본 동작을 적용한다. 월의 마지막 일을 넘으면 마지막 날로 조정할 수 있다. |
| `LENIENT` | 범위를 벗어난 값을 계산해 다음 달이나 해로 넘긴다. |

검색 입력에서는 `2026-02-30`을 다른 날짜로 자동 보정하기보다 사용자에게 오류를 알려야 하므로 `STRICT`가 적합하다.

```java
private static final DateTimeFormatter FORMATTER =
    new DateTimeFormatterBuilder()
        .appendPattern("uuMMdd")
        .toFormatter()
        .withResolverStyle(ResolverStyle.STRICT);
```

## 6. 재사용 가능한 날짜 검증기

빈 문자열의 앞뒤 공백을 정리하고 파싱을 한 번만 수행하도록 구현했다.

```java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;

public final class DateValidator {

    private static final DateTimeFormatter INPUT_FORMATTER =
        new DateTimeFormatterBuilder()
            .appendPattern("uuMMdd")
            .toFormatter()
            .withResolverStyle(ResolverStyle.STRICT);

    private DateValidator() {
    }

    public static LocalDate parseOptionalDate(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        if (!normalized.matches("\\d{6}")) {
            throw new IllegalArgumentException(
                "날짜는 숫자 6자리로 입력해주세요."
            );
        }

        try {
            return LocalDate.parse(normalized, INPUT_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                "존재하지 않는 날짜입니다.", e
            );
        }
    }
}
```

### 빈 값 허용

기간 검색에서는 시작일과 종료일 중 하나만 입력할 수 있으므로 `null`과 공백 문자열을 `null` 날짜로 변환한다. 생년월일처럼 필수 입력인 기능에서는 이 규칙을 재사용하지 말고 빈 값을 별도 오류로 처리해야 한다.

### 형식과 날짜 오류 분리

`2611AA`는 “숫자 6자리” 오류이고 `260230`은 “존재하지 않는 날짜” 오류다. 오류를 구분하면 사용자가 무엇을 수정해야 하는지 더 명확하게 안내할 수 있다.

### 파싱 결과 재사용

검증을 위해 파싱한 `LocalDate`를 버리지 않고 반환한다. 다시 `LocalDate.parse`를 호출할 필요가 없고 이후 비교와 DB 전달값 변환에 그대로 사용할 수 있다.

## 7. 시작일과 종료일 비교하기

두 날짜가 각각 유효해도 시작일이 종료일보다 늦으면 검색 범위가 잘못된 것이다.

```java
public final class DateRange {

    private DateRange() {
    }

    public static void validate(String startValue, String endValue) {
        LocalDate start = DateValidator.parseOptionalDate(startValue);
        LocalDate end = DateValidator.parseOptionalDate(endValue);

        if (start != null && end != null && start.isAfter(end)) {
            throw new IllegalArgumentException(
                "시작일은 종료일보다 늦을 수 없습니다."
            );
        }
    }
}
```

둘 중 하나가 비어 있으면 순서 비교를 생략하고 열린 검색 범위로 처리한다.

## 8. 두 자리 연도를 DB에 그대로 전달하지 않기

Java와 Oracle의 두 자리 연도 해석 정책에 의존하면 세기 경계에서 예상하지 못한 결과가 생길 수 있다. Java에서 검증된 `LocalDate`를 네 자리 연도로 출력해 Mapper에 전달하는 편이 명확하다.

```java
private static final DateTimeFormatter DB_FORMATTER =
    DateTimeFormatter.ofPattern("uuuuMMdd");

LocalDate date = DateValidator.parseOptionalDate("261106");
String dbDate = date == null ? null : date.format(DB_FORMATTER);

System.out.println(dbDate);
```

```text
20261106
```

Service 계층에서는 시작일과 종료일을 검증하고, Mapper 파라미터에는 변환된 `yyyyMMdd` 형태의 값을 담는다.

## 9. MyBatis와 Oracle 기간 검색

Oracle `DATE`에는 시·분·초가 포함될 수 있다. 종료일을 자정과 `<=`로 비교하면 해당 날짜의 자정 이후 데이터가 빠진다. 다음 날 미만으로 비교하면 종료일 하루 전체를 포함할 수 있다.

```xml
<trim prefix="WHERE" prefixOverrides="AND |OR ">
    <if test='searchType == "6"'>
        <if test="startDate != null and startDate != ''">
            AND REGDATE &gt;= TO_DATE(#{startDate}, 'YYYYMMDD')
        </if>

        <if test="endDate != null and endDate != ''">
            AND REGDATE &lt; TO_DATE(#{endDate}, 'YYYYMMDD') + 1
        </if>
    </if>
</trim>
```

종료일이 `20261106`이라면 조건은 다음과 같은 반개방 구간이 된다.

```text
2026-11-06 00:00:00 이상
2026-11-07 00:00:00 미만
```

Oracle `DATE`에 정수 `1`을 더하면 하루가 증가한다. `INTERVAL '1' DAY`도 사용할 수 있지만 컬럼과 표현식의 타입을 확인해야 하며, 단순한 `DATE` 비교에서는 `+ 1`이 의도를 간결하게 보여 준다.

가능하다면 SQL에서 문자열을 날짜로 바꾸기보다 JDBC/MyBatis 타입 핸들러를 통해 `LocalDate` 또는 SQL 날짜 타입을 바인딩하는 방법도 고려할 수 있다. 프로젝트 환경과 사용 중인 드라이버 버전에 맞춰 선택한다.

## 10. DateTimeFormatter와 SimpleDateFormat

| 비교 | `SimpleDateFormat` | `DateTimeFormatter` |
| --- | --- | --- |
| API | 기존 `Date`/`Calendar` | `java.time` |
| 스레드 안전성 | 스레드 안전하지 않음 | 불변이며 스레드 안전 |
| 엄격한 날짜 해석 | `setLenient(false)` | `ResolverStyle.STRICT` |
| 상수 재사용 | 동시 접근 주의 | 안전하게 재사용 가능 |

Java 8 이상에서 새 코드를 작성한다면 `LocalDate`와 `DateTimeFormatter`를 우선하는 편이 좋다.

## 11. 검증해야 할 경계값

날짜 검증기는 정상값 몇 개만 확인해서는 부족하다.

```text
정상 날짜       261106
월 범위 초과    261301
일 범위 초과    261132
평년 2월 29일   250229
윤년 2월 29일   240229
숫자 외 문자    2611AA
길이 부족       2611
빈 문자열       ""
공백 문자열     "   "
시작일 > 종료일 261130 / 261101
```

JUnit 테스트에서는 정상 파싱 결과, 잘못된 형식의 메시지, 존재하지 않는 날짜의 예외와 열린 범위를 각각 확인한다.

```java
@Test
public void leapDayIsValidOnlyInLeapYear() {
    assertEquals(
        LocalDate.of(2024, 2, 29),
        DateValidator.parseOptionalDate("240229")
    );
}

@Test(expected = IllegalArgumentException.class)
public void invalidDayIsRejected() {
    DateValidator.parseOptionalDate("250229");
}
```

## 12. 실무에서 주의할 점

### 프런트엔드와 백엔드 검증을 분리한다

JavaScript에서는 숫자 입력 제한과 길이 검사를 제공하고, Java Service에서는 형식과 실제 날짜를 최종 검증한다. 클라이언트 검사는 사용자 경험을 위한 것이며 신뢰 경계가 아니다.

### 빈 값 정책을 기능별로 정한다

검색 조건은 선택 사항일 수 있지만 결제일과 생년월일은 필수일 수 있다. 하나의 검증기가 모든 정책을 암묵적으로 결정하지 않도록 한다.

### 두 자리 연도 정책을 문서화한다

`26`을 2026년으로 해석하는 것은 자연스러워 보여도 업무 도메인에 따라 다를 수 있다. 입력 대상을 2000~2099년으로 제한하는지 명시하거나 네 자리 연도를 입력받는다.

### 사용자 입력 오류를 SQL 오류로 넘기지 않는다

입력 오류는 Java에서 검증해 명확한 메시지를 반환한다. MyBatis와 Oracle은 검증된 값으로 조회하는 책임에 집중시킨다.

## 정리

정규식은 `YYMMDD`의 모양을 확인할 수 있지만 실제 날짜의 존재 여부까지 판단하지 못한다. `DateTimeFormatter`와 `LocalDate`, `ResolverStyle.STRICT`를 사용하면 형식과 달력 유효성을 분리해 검증할 수 있다.

이번 구현에서 중요한 기준은 다음과 같다.

- 입력 형식과 실제 날짜 유효성은 별개의 검사다.
- 시작일과 종료일은 날짜 객체로 비교한다.
- 두 자리 연도 해석 정책을 명시한다.
- DB에는 검증된 네 자리 연도 값을 전달한다.
- 종료일은 다음 날 미만 조건으로 하루 전체를 포함한다.
- 사용자 입력 검증과 SQL 생성의 책임을 분리한다.

## 참고 자료

- [Oracle Java 8 DateTimeFormatter 문서](https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html)
- [Oracle Java 8 DateTimeFormatterBuilder 문서](https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatterBuilder.html)
- [Oracle Java 8 ResolverStyle 문서](https://docs.oracle.com/javase/8/docs/api/java/time/format/ResolverStyle.html)
- [Oracle Java 8 LocalDate 문서](https://docs.oracle.com/javase/8/docs/api/java/time/LocalDate.html)

