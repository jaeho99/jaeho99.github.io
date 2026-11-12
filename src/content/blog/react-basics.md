---
title: 'React 기초: 컴포넌트, Props, State와 Hook 이해하기'
description: '함수형 컴포넌트를 기준으로 JSX, Props, 이벤트, State, 목록 렌더링, 상태 끌어올리기와 Effect의 역할을 정리합니다.'
pubDate: 2026-11-12
category: 'Frontend'
subcategory: 'React'
tags: ['React', 'JavaScript', 'JSX', 'Hooks']
draft: false
---

React는 사용자 인터페이스를 컴포넌트 단위로 구성하는 JavaScript 라이브러리다. 화면을 직접 찾아 수정하기보다 현재 데이터가 어떤 UI를 만들어야 하는지 선언하고, 데이터가 바뀌면 React가 화면을 다시 계산하도록 만든다.

이 글은 **함수형 컴포넌트와 Hook**을 기준으로 React의 기본 흐름을 정리한다.

## 1. 컴포넌트는 UI를 반환하는 함수다

React 애플리케이션은 작은 컴포넌트를 조합해 만든다.

```jsx
function Welcome() {
  return <h1>React 기초</h1>
}

export default function App() {
  return (
    <main>
      <Welcome />
    </main>
  )
}
```

컴포넌트 이름은 HTML 태그와 구분할 수 있도록 대문자로 시작한다. 컴포넌트는 JSX를 반환하며 다른 컴포넌트 안에서 태그처럼 사용할 수 있다.

## 2. JSX로 JavaScript와 마크업 연결하기

JSX는 JavaScript 파일 안에서 HTML과 비슷한 마크업을 작성하는 문법이다.

```jsx
const user = {
  name: '재호',
  imageUrl: '/profile.png'
}

function Profile() {
  return (
    <section className="profile">
      <img src={user.imageUrl} alt={`${user.name} 프로필`} />
      <h2>{user.name}</h2>
    </section>
  )
}
```

중괄호 안에는 JavaScript 표현식을 넣을 수 있다. JSX에서는 `class` 대신 `className`을 사용하며, 여러 형제 요소를 반환할 때는 하나의 부모 요소나 Fragment(`<>...</>`)로 감싼다.

## 3. Props로 부모가 자식에게 값 전달하기

Props는 부모 컴포넌트가 자식 컴포넌트에 전달하는 읽기 전용 입력값이다.

```jsx
function UserCard({ name, role }) {
  return (
    <article>
      <strong>{name}</strong>
      <span>{role}</span>
    </article>
  )
}

export default function App() {
  return <UserCard name="재호" role="Backend Developer" />
}
```

자식이 Props를 직접 변경하지 않고, 다른 값이 필요하면 부모가 새 Props를 전달하도록 설계한다. 이 단방향 흐름 덕분에 값이 어디에서 왔는지 추적하기 쉽다.

## 4. 이벤트 처리하기

이벤트 속성에는 호출 결과가 아니라 함수를 전달한다.

```jsx
function SaveButton() {
  function handleClick() {
    console.log('저장 요청')
  }

  return <button onClick={handleClick}>저장</button>
}
```

`onClick={handleClick()}`로 작성하면 렌더링 중 함수가 즉시 실행된다. 클릭할 때 실행하려면 `onClick={handleClick}`처럼 함수 자체를 전달해야 한다.

인자가 필요하면 화살표 함수를 사용할 수 있다.

```jsx
<button onClick={() => removeTodo(todo.id)}>삭제</button>
```

## 5. `useState`로 컴포넌트가 값 기억하기

일반 지역 변수는 렌더링 사이에 유지되지 않고 값을 바꿔도 화면 갱신을 요청하지 않는다. UI에 영향을 주며 렌더링 사이에 기억해야 하는 값은 State로 관리한다.

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(current => current + 1)}>
      {count}번 클릭
    </button>
  )
}
```

`useState`는 현재 값과 그 값을 갱신하는 함수를 반환한다. Setter를 호출하면 React가 다음 상태를 저장하고 컴포넌트를 다시 렌더링한다.

다음 값이 이전 값에 의존하면 함수형 업데이트를 사용하면 안전하다.

```javascript
setCount(current => current + 1)
```

객체와 배열 State는 직접 수정하지 않고 새 값으로 교체한다.

```javascript
setUser(current => ({ ...current, name: '새 이름' }))

setTodos(current => [
  ...current,
  { id: crypto.randomUUID(), title: '새 작업', done: false }
])
```

## 6. 조건과 목록 렌더링

조건은 JavaScript의 조건문과 연산자를 사용한다.

```jsx
function Status({ isLoading, error }) {
  if (isLoading) return <p>불러오는 중...</p>
  if (error) return <p role="alert">{error}</p>
  return <p>완료</p>
}
```

목록은 `map`으로 컴포넌트 배열을 만든다.

```jsx
<ul>
  {todos.map(todo => (
    <li key={todo.id}>{todo.title}</li>
  ))}
</ul>
```

`key`는 형제 목록에서 항목을 안정적으로 식별하는 값이다. 삽입, 삭제, 정렬되는 목록에는 배열 index보다 데이터 고유 ID를 사용한다.

## 7. 폼 입력 제어하기

입력값을 State와 연결하면 React가 현재 값을 관리하는 제어 컴포넌트가 된다.

```jsx
import { useState } from 'react'

function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const normalized = title.trim()
    if (!normalized) return

    onAdd(normalized)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <button type="submit">추가</button>
    </form>
  )
}
```

`value`는 현재 State를, `onChange`는 다음 State를 연결한다.

## 8. 상태 끌어올리기

여러 컴포넌트가 같은 값을 공유해야 하면 각각 State를 만들기보다 가장 가까운 공통 부모로 상태를 옮긴다.

```jsx
function CounterButton({ count, onIncrease }) {
  return <button onClick={onIncrease}>{count}</button>
}

export default function App() {
  const [count, setCount] = useState(0)

  function handleIncrease() {
    setCount(current => current + 1)
  }

  return (
    <>
      <CounterButton count={count} onIncrease={handleIncrease} />
      <CounterButton count={count} onIncrease={handleIncrease} />
    </>
  )
}
```

부모가 State를 소유하고 자식에게 값과 이벤트 처리 함수를 Props로 전달한다. 이를 상태 끌어올리기라고 한다.

## 9. `useEffect`는 외부 시스템과 동기화할 때 사용한다

Effect는 렌더링 자체가 아니라 네트워크, 브라우저 API, 타이머나 외부 라이브러리 같은 시스템과 컴포넌트를 동기화할 때 사용한다.

```jsx
import { useEffect, useState } from 'react'

function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timerId)
  }, [])

  return <time>{now.toLocaleTimeString()}</time>
}
```

Effect에서 구독이나 타이머를 만들었다면 cleanup 함수에서 해제한다. Props나 State만으로 계산할 수 있는 값을 Effect와 별도 State로 복제하면 흐름이 복잡해지므로 렌더링 중 계산하는 편이 낫다.

## 10. Hook의 규칙

`useState`, `useEffect`처럼 `use`로 시작하는 함수가 Hook이다.

- 컴포넌트 또는 사용자 정의 Hook의 최상위에서 호출한다.
- 조건문, 반복문, 중첩 함수 안에서 호출하지 않는다.
- 렌더링은 같은 입력에 같은 결과를 반환하도록 순수하게 유지한다.

이 규칙을 지켜야 React가 여러 렌더링 사이에 Hook 상태를 같은 순서로 연결할 수 있다.

## 추천 학습 순서

1. 컴포넌트와 JSX
2. Props와 이벤트
3. `useState`와 불변 업데이트
4. 조건·목록·폼 렌더링
5. 상태 끌어올리기
6. 꼭 필요한 외부 동기화에만 `useEffect` 사용
7. 작은 프로젝트에 라우팅과 API 통신 추가

처음부터 전역 상태 라이브러리를 도입하기보다 컴포넌트 경계와 State 소유 위치를 먼저 익히는 것이 중요하다.

## 참고 자료

- [React 공식 문서: Quick Start](https://react.dev/learn)
- [React 공식 문서: Installation](https://react.dev/learn/installation)
- [React 공식 문서: State](https://react.dev/learn/state-a-components-memory)
- [React 공식 문서: Managing State](https://react.dev/learn/managing-state)

