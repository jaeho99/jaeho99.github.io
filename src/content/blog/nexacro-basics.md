---
title: '넥사크로 기초: Form, Dataset, Grid와 transaction 흐름 이해하기'
description: '넥사크로 화면 개발에서 자주 사용하는 Form, 컴포넌트, Dataset, 데이터 바인딩, 이벤트와 서버 통신 구조를 정리합니다.'
pubDate: 2026-11-12
category: 'Frontend'
subcategory: 'Nexacro'
tags: ['Nexacro', 'Dataset', 'Grid', 'Enterprise UI']
draft: false
---

넥사크로는 기업 업무 시스템의 화면을 만들 때 사용하는 UI 개발 플랫폼이다. 일반 웹 개발과 비교하면 화면 컴포넌트뿐 아니라 데이터 모델, 바인딩, 서버 통신 규칙을 플랫폼이 함께 제공한다는 점이 특징이다.

제품 버전과 회사 공통 프레임워크에 따라 함수와 설정이 달라질 수 있으므로 이 글은 공통 개념을 익히기 위한 입문 자료로 봐야 한다. 실제 프로젝트에서는 사용 중인 버전의 공식 문서와 공통 모듈을 먼저 확인한다.

## 1. 전체 흐름

넥사크로 화면 개발의 기본 흐름은 다음과 같다.

```text
Form
 ├─ 화면 컴포넌트: Button, Edit, Combo, Grid ...
 ├─ 보이지 않는 객체: Dataset ...
 ├─ BindItem: 컴포넌트와 Dataset 연결
 └─ Script: 이벤트, 검증, transaction 처리
```

화면에서 사용자가 버튼을 누르면 이벤트 함수가 실행되고, `transaction`으로 서버를 호출한다. 서버에서 받은 데이터는 Dataset에 담기며, 바인딩된 Grid와 입력 컴포넌트가 이를 표시한다.

## 2. Form과 컴포넌트

Form은 사용자가 실제로 조작하는 한 화면의 기본 단위다. 디자인 영역에 컴포넌트를 배치하고 Properties에서 속성과 이벤트를 설정한다.

자주 사용하는 컴포넌트는 다음과 같다.

- `Static`: 제목과 안내 문구
- `Edit`, `TextArea`, `MaskEdit`: 값 입력
- `Button`: 사용자 동작 실행
- `Combo`, `Radio`, `CheckBox`: 선택 입력
- `Calendar`: 날짜 입력
- `Grid`: 목록 데이터 표시와 편집
- `Div`, `Tab`: 화면 영역 구성

컴포넌트 ID는 스크립트에서 객체를 찾는 이름이므로 역할이 드러나게 정한다.

```javascript
this.btnSearch_onclick = function (obj, e) {
    this.fnSearch();
};
```

이벤트 함수의 `obj`는 이벤트가 발생한 컴포넌트, `e`는 이벤트 정보를 담는다.

## 3. Dataset이 실제 데이터를 가진다

Grid는 데이터를 보여 주는 형식이고 실제 데이터는 Dataset이 가진다. Dataset은 컬럼과 행으로 이루어진 클라이언트 데이터 모델이며 추가, 수정, 삭제 상태도 관리한다.

```javascript
var row = this.dsUser.addRow();
this.dsUser.setColumn(row, "userId", "U001");
this.dsUser.setColumn(row, "userName", "재호");

var name = this.dsUser.getColumn(row, "userName");
this.dsUser.deleteRow(row);
```

현재 선택된 행은 `rowposition`, 전체 행 수는 `rowcount`로 확인할 수 있다.

```javascript
var row = this.dsUser.rowposition;
if (row < 0) {
    this.alert("선택된 사용자가 없습니다.");
    return;
}
```

화면 로직을 작성할 때 Grid의 셀을 직접 데이터 저장소처럼 다루기보다 Dataset을 기준으로 처리한다.

## 4. Dataset과 컴포넌트 바인딩

데이터 바인딩은 Dataset과 화면 컴포넌트를 연결해 한쪽의 변경을 다른 쪽에 반영하는 기능이다.

- Grid 전체에 Dataset을 연결하는 Full Binding
- 현재 행의 특정 컬럼을 Edit 등에 연결하는 단건 바인딩
- Combo의 선택 목록을 별도 Dataset으로 연결하는 Lookup Binding

Grid에서는 `binddataset` 속성으로 Dataset을 연결한다. 데이터가 바뀌면 Grid가 갱신되고, 편집 가능한 Grid에서 값을 수정하면 Dataset에도 반영된다.

검색 목록과 상세 입력을 같은 Dataset에 바인딩하면 Grid의 선택 행이 바뀔 때 상세 입력 필드도 함께 바뀌는 Master–Detail 화면을 만들 수 있다.

## 5. 조회·추가·삭제 버튼 만들기

```javascript
this.btnSearch_onclick = function (obj, e) {
    this.fnSearch();
};

this.btnAdd_onclick = function (obj, e) {
    var row = this.dsUser.addRow();
    this.dsUser.setColumn(row, "useYn", "Y");
    this.dsUser.set_rowposition(row);
};

this.btnDelete_onclick = function (obj, e) {
    var row = this.dsUser.rowposition;
    if (row >= 0) {
        this.dsUser.deleteRow(row);
    }
};
```

실제 저장 전에는 필수값, 길이와 업무 규칙을 검증한다. 화면 검증은 빠른 피드백을 위한 것이며 서버가 최종 유효성을 다시 확인해야 한다.

## 6. `transaction`으로 서버 호출하기

Form의 `transaction`은 Dataset과 변수를 서버에 보내고 결과 Dataset을 받는 기본 통신 방법이다.

```javascript
this.fnSearch = function () {
    var serviceId = "searchUsers";
    var serviceUrl = "svc::user/search.do";
    var inDatasets = "dsSearch=dsSearch";
    var outDatasets = "dsUser=dsUser";
    var argumentsText = "";
    var callback = "fnCallback";

    this.transaction(
        serviceId,
        serviceUrl,
        inDatasets,
        outDatasets,
        argumentsText,
        callback,
        true
    );
};
```

입출력 Dataset 문자열은 보통 `서버이름=화면Dataset` 또는 프로젝트가 정한 매핑 형식을 사용한다. 프로젝트 공통 transaction 함수가 있다면 직접 호출 대신 그 규칙을 따른다.

콜백에서는 서비스 ID와 오류 코드를 확인한다.

```javascript
this.fnCallback = function (serviceId, errorCode, errorMessage) {
    if (errorCode < 0) {
        this.alert(errorMessage);
        return;
    }

    if (serviceId === "searchUsers") {
        this.trace("조회 건수: " + this.dsUser.rowcount);
    }
};
```

기본 비동기 호출에서는 `transaction` 다음 줄이 통신 완료 전에 실행될 수 있다. 결과에 의존하는 처리는 콜백에서 수행한다.

## 7. Dataset의 행 상태

Dataset은 조회된 원본 행과 사용자가 추가·수정·삭제한 행을 구분한다. 저장 기능에서는 이 상태를 서버가 이해할 수 있도록 전송하고, 서버는 상태에 따라 INSERT, UPDATE, DELETE를 처리한다.

삭제된 행은 화면에서 사라져도 별도 삭제 버퍼에 남을 수 있다. 저장 완료 전에 `clearData`나 `reset`을 무심코 호출하면 변경 내역이 사라질 수 있으므로 주의한다.

저장 전에는 보통 다음을 확인한다.

- 변경된 행이 있는가
- 필수 컬럼이 입력되었는가
- 중복이나 업무 규칙 위반이 없는가
- 저장 성공 후 Dataset을 재조회할 것인가, 변경 상태만 초기화할 것인가

## 8. 디버깅할 때 확인할 것

- `trace()`로 서비스 ID, 인자, 행 수와 콜백 오류 출력
- Dataset Viewer에서 컬럼, 값, 행 상태 확인
- Grid의 `binddataset`과 컬럼 바인딩 확인
- 서비스 URL alias와 실제 서버 경로 확인
- 입력 Dataset과 출력 Dataset의 매핑 방향 확인
- 비동기 결과를 콜백 밖에서 먼저 사용하지 않았는지 확인

Grid에 값이 보이지 않을 때는 서버 응답만 보지 말고 **응답 → 출력 Dataset → Grid 바인딩** 순서로 끊어서 확인한다.

## 정리

넥사크로의 핵심은 화면 컴포넌트보다 데이터 흐름에 있다.

```text
사용자 이벤트
→ 입력값과 Dataset 검증
→ transaction
→ 서버 처리
→ 출력 Dataset
→ 바인딩된 화면 갱신
```

이 구조를 이해하면 조회·저장·팝업 같은 업무 화면을 읽는 속도가 빨라진다. 다음 단계로는 공통 transaction 모듈, Grid 포맷, 팝업 데이터 전달, Dataset 행 상태와 서버 매핑을 학습하면 좋다.

## 참고 자료

- [TOBESOFT 공식 문서: Nexacro N 컴포넌트 활용](https://docs.tobesoft.com/developer_guide_nexacro_n_en)
- [TOBESOFT 공식 문서: Dataset](https://docs.tobesoft.com/developer_guide_nexacro_n_en/b8bf13b0f85b8e92)
- [TOBESOFT 공식 문서: Grid 기초](https://docs.tobesoft.com/developer_guide_nexacro_n_v24_en/fff4e0be2bd23e59)
- [TOBESOFT 공식 문서: Form transaction](https://docs.tobesoft.com/reference_guide_nexacro_n_v24_ko/Form)

