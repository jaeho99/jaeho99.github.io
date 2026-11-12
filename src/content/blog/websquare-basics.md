---
title: '웹스퀘어 기초: 화면 XML, DataCollection과 Submission 이해하기'
description: '웹스퀘어5 화면 개발의 구성 요소, 이벤트, DataMap·DataList, 데이터 바인딩과 Submission 통신 흐름을 정리합니다.'
pubDate: 2026-11-12
category: 'JavaScript · Frontend'
tags: ['WebSquare5', 'DataCollection', 'Submission', 'Enterprise UI']
draft: false
---

웹스퀘어5는 기업용 웹 화면을 개발하기 위한 UI 플랫폼이다. 스튜디오에서 컴포넌트를 배치하고 XML로 화면 구조를 정의하며, JavaScript 이벤트와 DataCollection, Submission을 이용해 데이터와 서버 통신을 처리한다.

웹스퀘어는 버전과 사내 공통 프레임워크에 따라 생성 코드, 유틸 함수와 통신 규칙이 다르다. 이 글의 예시는 개념을 설명하기 위한 형태이며 실제 프로젝트에서는 사용 중인 버전의 API와 공통 가이드를 확인해야 한다.

## 1. 화면을 구성하는 요소

기본 화면은 다음 요소가 함께 동작한다.

```text
화면 XML
 ├─ UI 컴포넌트: input, trigger, gridView ...
 ├─ DataCollection: dataMap, dataList ...
 ├─ Submission: 서버 요청과 응답 매핑
 └─ Script: 이벤트와 화면 로직
```

XML은 컴포넌트와 데이터 객체의 선언을 담고, JavaScript는 사용자의 동작과 업무 로직을 처리한다. 스튜디오의 Design과 Source 화면을 함께 보면서 생성되는 구조를 익히는 것이 좋다.

## 2. 컴포넌트와 이벤트

화면에는 입력, 선택, 버튼, Grid와 레이아웃 컴포넌트를 배치한다. 각 컴포넌트는 고유 ID를 가지며 스크립트에서 ID로 접근한다.

```javascript
scwin.btnSearch_onclick = function (e) {
    scwin.search();
};
```

웹스퀘어 프로젝트에서는 화면별 함수와 이벤트를 `scwin` 객체에 정의하는 형태를 자주 볼 수 있다. 이벤트 이름과 인자 구조는 컴포넌트 및 버전에 따라 달라질 수 있다.

```javascript
scwin.search = function () {
    var keyword = iptKeyword.getValue();
    dmSearch.set("keyword", keyword);
    sbmSearch.submit();
};
```

컴포넌트 API로 값을 읽고 DataCollection에 담은 뒤 Submission을 실행하는 흐름이다.

## 3. DataCollection이 화면 데이터를 관리한다

DataCollection은 브라우저 메모리에서 화면 데이터를 관리하는 웹스퀘어의 데이터 모델이다.

- `DataMap`: key/value 형태의 단건 데이터
- `DataList`: 행과 열을 가진 목록 데이터
- `LinkedDataList`: DataList를 정렬하거나 필터링한 결과

검색 조건이나 상세 정보는 DataMap, Grid에 표시할 목록은 DataList로 표현하는 경우가 많다.

```javascript
dmSearch.set("keyword", "Spring");
var keyword = dmSearch.get("keyword");
```

DataList는 행 추가, 값 변경과 삭제 같은 목록 작업을 제공한다. 정확한 메서드 시그니처는 프로젝트 버전의 API를 확인한다.

```javascript
var rowIndex = dlUser.insertRow();
dlUser.setCellData(rowIndex, "userName", "재호");
```

DataCollection은 데이터의 추가·수정·삭제 상태도 관리할 수 있어 저장 요청을 구성할 때 활용된다.

## 4. 데이터 바인딩

컴포넌트와 DataCollection을 바인딩하면 데이터 변경을 화면에 반영하고 입력값을 데이터 모델에 저장할 수 있다.

```text
DataMap.userName ↔ Input
DataList          ↔ GridView
```

GridView는 표시와 편집을 담당하고 실제 목록은 DataList에 저장된다. 문제가 생기면 GridView의 셀만 확인하지 말고 연결된 DataList의 컬럼과 값을 먼저 확인한다.

바인딩을 사용할 때는 다음을 맞춰야 한다.

- 컴포넌트 ID와 DataCollection ID
- DataMap의 key 또는 DataList의 column ID
- 입력·출력 방향
- 숫자, 날짜와 문자열 형식

## 5. Submission으로 서버와 통신하기

Submission은 서버 요청에 보낼 데이터와 응답을 저장할 DataCollection을 연결한다.

```text
입력 DataCollection
→ Submission 실행
→ 서버 API
→ 응답
→ 출력 DataCollection
→ 바인딩된 화면 갱신
```

스튜디오에서 Submission을 만들 때 일반적으로 다음을 설정한다.

- 요청 URL과 HTTP Method
- 요청에 포함할 DataMap/DataList
- 응답을 받을 DataMap/DataList
- 데이터 형식과 미디어 타입
- 성공·오류 이벤트

```javascript
scwin.btnSearch_onclick = function () {
    sbmSearch.submit();
};

scwin.sbmSearch_submitdone = function (e) {
    console.log("조회 건수", dlUser.getRowCount());
};

scwin.sbmSearch_submiterror = function (e) {
    console.error("조회 실패", e);
};
```

실제 이벤트 이름은 설정과 버전에 따라 다를 수 있다. 프로젝트에서 공통 Submission 실행 함수와 공통 오류 처리를 제공한다면 이를 우선 사용한다.

## 6. 조회 화면의 기본 구조

사용자 목록 조회 화면을 예로 들면 다음 순서로 동작한다.

1. 검색어 Input을 DataMap에 연결한다.
2. 조회 버튼 이벤트에서 입력값을 검증한다.
3. 조회 Submission을 실행한다.
4. 서버가 목록 JSON 또는 XML을 반환한다.
5. 응답을 DataList에 저장한다.
6. DataList와 연결된 GridView가 목록을 표시한다.

```javascript
scwin.search = function () {
    var keyword = dmSearch.get("keyword");

    if (keyword && keyword.length > 50) {
        alert("검색어는 50자 이내로 입력하세요.");
        return;
    }

    sbmSearch.submit();
};
```

통신 완료 뒤의 로직은 비동기 처리 시점을 고려해 완료 이벤트에서 실행한다.

## 7. GridView와 DataList를 함께 생각하기

GridView는 업무 화면에서 가장 많이 사용하는 컴포넌트 중 하나다. 컬럼 표시, 편집, 정렬과 선택을 담당하지만 데이터 변경의 기준은 연결된 DataList다.

새 행을 추가하거나 선택 행을 삭제할 때도 DataList의 상태를 함께 확인한다.

```javascript
scwin.btnAdd_onclick = function () {
    var row = dlUser.insertRow();
    dlUser.setCellData(row, "useYn", "Y");
};
```

저장 화면에서는 다음 항목을 확인한다.

- 변경된 행만 서버에 전송하는가
- 필수값과 중복값을 검증했는가
- 삭제 행이 전송 대상에 포함되는가
- 성공 후 데이터 상태를 초기화하거나 재조회하는가
- Grid의 표시 형식과 서버 데이터 타입이 맞는가

## 8. 화면 초기화와 공통 코드

화면이 로드될 때 공통 코드 조회, 초기값 설정과 첫 조회를 수행하는 경우가 많다.

```javascript
scwin.onpageload = function () {
    dmSearch.set("useYn", "Y");
    scwin.search();
};
```

여러 화면에서 반복하는 메시지, 팝업, 공통 코드, 권한과 Submission 오류 처리는 공통 유틸로 제공되는 경우가 많다. 새 함수를 만들기 전에 프로젝트의 공통 API를 찾는 습관이 중요하다.

## 9. 디버깅 순서

조회 결과가 화면에 나오지 않을 때는 다음 순서로 분리해서 확인한다.

1. 버튼 이벤트가 실행되는가
2. 입력 DataMap/DataList에 값이 들어갔는가
3. Submission URL과 요청 형식이 맞는가
4. 서버 응답 상태와 본문은 정상인가
5. 응답이 출력 DataCollection에 매핑되었는가
6. GridView가 올바른 DataList와 컬럼을 바라보는가

브라우저 개발자 도구의 Network와 Console, 웹스퀘어 스튜디오의 디버깅 기능을 함께 사용한다. 서버 응답이 성공했더라도 응답 키와 DataCollection 컬럼이 다르면 화면에는 값이 표시되지 않을 수 있다.

## 넥사크로와 개념 비교

둘은 API가 같지 않지만 입문 단계에서 다음처럼 대응해 이해할 수 있다.

| 역할 | 넥사크로 | 웹스퀘어5 |
| --- | --- | --- |
| 화면 정의 | Form/XFDL | 화면 XML |
| 단건·목록 데이터 | Dataset | DataMap/DataList |
| 목록 UI | Grid | GridView |
| 서버 통신 | transaction | Submission |
| 화면 로직 | Form Script | `scwin` 중심 Script |

이 표는 개념 이해를 위한 비교이며 기능이 완전히 일대일로 같다는 의미는 아니다.

## 정리

웹스퀘어 화면을 이해할 때는 컴포넌트만 보지 말고 다음 연결을 따라가야 한다.

```text
컴포넌트 이벤트
→ DataCollection
→ Submission
→ 서버
→ 응답 DataCollection
→ 바인딩된 컴포넌트
```

이 흐름을 익힌 뒤 GridView 편집, 공통 코드, 팝업, 유효성 검증과 공통 Submission 모듈로 범위를 넓히면 실무 화면을 읽기 쉬워진다.

## 참고 자료

- [인스웨이브 공식 문서: 웹스퀘어5 SP5 개발 가이드](https://docs1.inswave.com/sp5_user_guide)
- [인스웨이브 공식 문서: DataCollection](https://docs1.inswave.com/sp5_user_guide/e8b94a03286e4f9f)
- [인스웨이브 공식 문서: 화면 구조와 동작](https://docs1.inswave.com/sp5_user_guide/0b2522fda37f4e81)

