---
title: 'Vue.js 기초: 반응성부터 컴포넌트까지 한 번에 이해하기'
description: 'Vue 3와 Composition API를 기준으로 프로젝트 생성, 템플릿 문법, 반응형 상태, 디렉티브, 폼 바인딩과 컴포넌트 통신을 정리합니다.'
pubDate: 2026-11-12
category: 'Frontend'
subcategory: 'Vue'
tags: ['Vue.js', 'Vue 3', 'Composition API', 'JavaScript']
draft: false
---

Vue는 HTML, CSS, JavaScript를 바탕으로 사용자 인터페이스를 만드는 JavaScript 프레임워크다. 화면을 데이터에 맞춰 선언적으로 표현하고, 상태가 바뀌면 필요한 DOM을 자동으로 갱신한다. 또 화면을 독립적인 컴포넌트로 나눠 재사용할 수 있다.

이 글은 **Vue 3, Single-File Component, Composition API와 `<script setup>`**을 기준으로 한다.

## 1. 프로젝트 시작하기

Node.js가 준비되어 있다면 Vue 공식 프로젝트 생성 도구인 `create-vue`를 사용할 수 있다.

```bash
npm create vue@latest
cd my-vue-app
npm install
npm run dev
```

생성 과정에서는 TypeScript, Vue Router, Pinia, 테스트 도구 등을 선택할 수 있다. 문법을 처음 익힐 때는 필요한 기능만 선택하고, 각 도구의 역할을 이해한 뒤 추가하는 편이 좋다.

기본 프로젝트의 중심은 보통 다음과 같다.

```text
src/
├─ assets/       정적 리소스
├─ components/   재사용할 컴포넌트
├─ App.vue       루트 컴포넌트
└─ main.js       애플리케이션 시작점
```

`main.js`는 Vue 애플리케이션을 만들고 HTML의 특정 요소에 연결한다.

```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

## 2. Single-File Component

Vue에서는 화면 구조, 동작, 스타일을 `.vue` 파일 하나에 모은 Single-File Component를 주로 사용한다.

```vue
<script setup>
const title = 'Vue 기초'
</script>

<template>
  <main>
    <h1>{{ title }}</h1>
  </main>
</template>

<style scoped>
h1 {
  color: #42b883;
}
</style>
```

- `<script setup>`: 상태와 함수를 선언한다.
- `<template>`: 상태를 이용해 화면 구조를 표현한다.
- `<style scoped>`: 현재 컴포넌트에 한정할 스타일을 작성한다.

`{{ title }}`처럼 값을 출력하는 문법을 텍스트 보간법이라고 한다. 템플릿에서는 컴포넌트의 상태와 계산된 값을 HTML에 연결할 수 있다.

## 3. `ref`로 반응형 상태 만들기

화면과 함께 변해야 하는 값은 `ref`로 선언할 수 있다.

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increase() {
  count.value++
}
</script>

<template>
  <button @click="increase">
    {{ count }}번 클릭
  </button>
</template>
```

JavaScript 영역에서 `ref`의 값에 접근할 때는 `count.value`를 사용한다. 템플릿에서는 Vue가 값을 풀어 주므로 `count`라고 작성한다. 값이 변경되면 Vue가 변화를 추적해 관련 화면을 다시 그린다.

여러 속성을 가진 객체에는 `reactive`도 사용할 수 있다.

```javascript
import { reactive } from 'vue'

const user = reactive({
  name: '재호',
  level: 1
})

user.level++
```

처음에는 단일 값과 객체 모두 `ref`를 중심으로 사용하면 일관성을 유지하기 쉽다. `reactive`는 객체 자체를 교체하거나 구조 분해할 때 반응성이 끊길 수 있는 지점을 이해한 뒤 선택하는 편이 안전하다.

## 4. 자주 쓰는 템플릿 문법

### 속성 바인딩: `v-bind`

HTML 속성에 JavaScript 값을 연결한다. 축약형은 `:`이다.

```vue
<a :href="profileUrl" :class="{ active: isActive }">
  프로필
</a>
```

### 이벤트 처리: `v-on`

DOM 이벤트를 처리한다. 축약형은 `@`이다.

```vue
<button @click="save">저장</button>
<form @submit.prevent="save">...</form>
```

`.prevent`는 기본 제출 동작을 막는 이벤트 수식어다. 이 밖에도 `.stop`, 키보드 이벤트용 `.enter` 등을 사용할 수 있다.

### 조건부 렌더링

```vue
<p v-if="isLoading">불러오는 중...</p>
<p v-else-if="hasError">오류가 발생했습니다.</p>
<p v-else>불러오기를 완료했습니다.</p>
```

`v-if`는 조건에 따라 요소를 생성하거나 제거한다. 자주 보이기만 전환하는 요소라면 CSS `display`를 바꾸는 `v-show`도 고려할 수 있다.

### 목록 렌더링

```vue
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.title }}
  </li>
</ul>
```

목록에는 각 항목을 안정적으로 식별할 수 있는 고유한 `key`를 지정하는 것이 중요하다. 배열 위치인 index보다 데이터의 ID를 우선한다.

## 5. `computed`로 파생 상태 표현하기

기존 상태에서 계산할 수 있는 값은 별도 상태로 중복 저장하지 않고 `computed`로 표현한다.

```vue
<script setup>
import { computed, ref } from 'vue'

const todos = ref([
  { id: 1, title: 'Vue 문법 익히기', done: true },
  { id: 2, title: '작은 예제 만들기', done: false }
])

const remainingCount = computed(() =>
  todos.value.filter(todo => !todo.done).length
)
</script>

<template>
  <p>남은 작업: {{ remainingCount }}</p>
</template>
```

`computed`는 의존하는 반응형 값이 바뀔 때 다시 계산된다. 단순히 특정 값의 변화를 감지해 API 호출이나 로그 기록 같은 부수 효과를 실행해야 한다면 `watch`나 `watchEffect`가 더 적합하다.

## 6. `v-model`로 폼 입력 연결하기

`v-model`은 입력 요소의 값과 상태를 양방향으로 연결한다.

```vue
<script setup>
import { ref } from 'vue'

const name = ref('')
const agreed = ref(false)
</script>

<template>
  <input v-model.trim="name" placeholder="이름">
  <label>
    <input v-model="agreed" type="checkbox">
    약관 동의
  </label>
  <p>{{ name }} / 동의: {{ agreed }}</p>
</template>
```

`.trim`은 앞뒤 공백을 제거한다. 숫자로 변환하는 `.number`, 입력이 끝난 뒤 값을 반영하는 `.lazy` 수식어도 있다. 다만 프런트엔드 입력 제한만 신뢰해서는 안 되며 서버에서도 다시 검증해야 한다.

## 7. 컴포넌트와 단방향 데이터 흐름

컴포넌트는 화면을 독립적이고 재사용 가능한 단위로 나누는 방법이다. 부모는 `props`로 데이터를 내려주고, 자식은 `emit`으로 사건을 알리는 흐름이 기본이다.

```vue
<!-- TodoItem.vue -->
<script setup>
defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <button @click="emit('toggle', todo.id)">
    {{ todo.done ? '완료' : '진행 중' }} · {{ todo.title }}
  </button>
</template>
```

```vue
<!-- App.vue -->
<script setup>
import { ref } from 'vue'
import TodoItem from './components/TodoItem.vue'

const todos = ref([
  { id: 1, title: 'Vue 기초 정리', done: false }
])

function toggleTodo(id) {
  const todo = todos.value.find(item => item.id === id)
  if (todo) todo.done = !todo.done
}
</script>

<template>
  <TodoItem
    v-for="todo in todos"
    :key="todo.id"
    :todo="todo"
    @toggle="toggleTodo"
  />
</template>
```

자식이 `props`를 직접 수정하기보다 변경 의도를 이벤트로 전달하고, 데이터를 가진 부모가 실제 상태를 변경하도록 만들면 흐름을 추적하기 쉽다.

## 8. 생명주기 훅

컴포넌트가 화면에 연결되거나 제거되는 시점에 코드를 실행할 수 있다.

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

function handleResize() {
  console.log(window.innerWidth)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
```

`onMounted`는 DOM 접근이나 외부 라이브러리 초기화에 자주 사용한다. 직접 등록한 타이머와 전역 이벤트는 `onUnmounted`에서 해제해 누수를 방지한다.

## 9. 다음 학습 순서

기초 문법을 익혔다면 작은 할 일 관리 앱을 만들어 보는 것이 좋다.

1. `ref`로 입력값과 목록 관리
2. `v-model`로 새 작업 입력
3. `v-for`로 목록 출력
4. `computed`로 남은 작업 수 계산
5. 항목을 컴포넌트로 분리하고 Props/Emit 적용
6. 새로고침 뒤에도 유지되도록 `localStorage` 연결
7. Vitest로 상태 변경 로직 테스트

그다음 여러 화면이 필요하면 Vue Router, 여러 컴포넌트가 공유하는 상태가 복잡해지면 Pinia를 학습한다. 라우터와 전역 상태 관리부터 시작하기보다, 먼저 컴포넌트 안의 상태와 부모·자식 데이터 흐름을 익히는 편이 전체 구조를 이해하기 쉽다.

## 정리

Vue의 핵심은 많은 문법을 외우는 데 있지 않다.

- 상태는 `ref`로 선언한다.
- 템플릿은 상태에 따라 화면을 선언한다.
- 파생 값은 `computed`로 표현한다.
- 입력은 `v-model`, 이벤트는 `@`로 연결한다.
- 화면은 컴포넌트로 나누고 Props와 Emit으로 통신한다.

이 흐름을 이해하면 Vue 애플리케이션이 결국 **상태가 변하고, 그 상태를 사용하는 화면이 갱신되는 구조**라는 점이 보이기 시작한다.

## 참고 자료

- [Vue 공식 문서: Introduction](https://vuejs.org/guide/introduction.html)
- [Vue 공식 문서: Quick Start](https://vuejs.org/guide/quick-start.html)
- [Vue 공식 문서: Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue 공식 문서: Components Basics](https://vuejs.org/guide/essentials/component-basics.html)

