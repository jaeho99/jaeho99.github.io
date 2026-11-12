---
title: 'CI/CD 개념과 용어, 파이프라인 종류 한 번에 정리하기'
description: '지속적 통합·전달·배포의 차이부터 Stage, Job, Artifact, Runner 같은 용어와 브랜치·PR·모노레포 파이프라인 및 배포 전략을 정리합니다.'
pubDate: 2026-11-12
category: 'DevOps'
subcategory: 'CI/CD'
tags: ['CI/CD', 'DevOps', 'GitHub Actions', 'Deployment']
draft: false
---

코드를 작성한 뒤 사용자에게 전달하기까지는 빌드, 테스트, 패키징과 배포 같은 반복 작업이 필요하다. 이 과정을 사람이 매번 같은 순서로 수행하면 누락과 환경 차이가 발생하기 쉽다. CI/CD는 코드 변경을 검증하고 전달하는 과정을 자동화해 더 작고 안전한 단위로 자주 배포할 수 있게 만드는 개발 방식이다.

## 1. CI, Continuous Delivery, Continuous Deployment

### CI: 지속적 통합

Continuous Integration은 개발자가 변경사항을 공유 저장소에 자주 통합하고, 통합할 때마다 자동 빌드와 테스트로 문제를 빠르게 찾는 방식이다.

```text
코드 Push 또는 Pull Request
→ 의존성 설치
→ 정적 분석
→ 빌드
→ 단위·통합 테스트
→ 결과 보고
```

CI의 목적은 단순히 테스트 명령을 자동 실행하는 데 있지 않다. 변경사항이 기존 코드와 함께 정상 동작하는지 빠른 피드백을 제공해 통합 위험을 줄이는 것이 핵심이다.

### Continuous Delivery: 지속적 전달

지속적 전달은 검증된 결과물을 언제든 운영 환경에 배포할 수 있는 상태로 유지한다. 운영 배포 직전에 승인 버튼이나 변경 관리 절차가 남을 수 있다.

```text
CI 통과
→ 배포 가능한 Artifact 생성
→ 스테이징 자동 배포
→ 검증
→ 운영 배포 승인
→ 운영 반영
```

### Continuous Deployment: 지속적 배포

지속적 배포는 자동화된 검증을 통과한 변경사항을 사람의 최종 승인 없이 운영 환경까지 자동 반영한다.

두 용어가 모두 CD로 축약되므로 팀에서는 “운영 배포에 수동 승인이 존재하는가?”를 기준으로 의미를 명확히 하는 편이 좋다.

| 구분 | 자동화 범위 | 운영 반영 |
| --- | --- | --- |
| CI | 통합, 빌드, 테스트 | 범위 밖 |
| Continuous Delivery | 운영 직전까지 | 보통 승인 후 실행 |
| Continuous Deployment | 운영까지 전체 | 검증 통과 시 자동 |

## 2. CI/CD 파이프라인이란

파이프라인은 소스 코드가 배포 가능한 결과물이 되어 환경에 반영되기까지의 작업을 코드로 표현한 흐름이다.

```text
Source
  ↓
Validate
  ↓
Build
  ↓
Test
  ↓
Package
  ↓
Deploy
  ↓
Verify
```

모든 프로젝트가 이 단계를 그대로 사용해야 하는 것은 아니다. 정적 사이트는 빌드 결과를 호스팅에 업로드하면 끝날 수 있고, 백엔드 서비스는 컨테이너 이미지 생성, 보안 검사, 스테이징 검증과 점진적 배포가 추가될 수 있다.

## 3. 핵심 용어

### Workflow 또는 Pipeline

자동화 과정 전체를 의미한다. GitHub Actions는 Workflow, GitLab과 Jenkins는 주로 Pipeline이라는 용어를 사용한다.

### Trigger 또는 Event

파이프라인 실행을 시작하는 조건이다.

- 브랜치 Push
- Pull/Merge Request 생성과 갱신
- 태그 또는 Release 생성
- 정해진 시간
- 수동 실행
- 외부 시스템의 API 호출

### Stage

Build, Test, Deploy처럼 목적이 구분되는 작업 묶음이다. 앞 단계가 성공해야 다음 단계로 이동하도록 구성하는 경우가 많다.

### Job

Runner에서 실행되는 작업 단위다. 같은 Stage의 여러 Job을 병렬로 실행할 수 있다.

```text
Test Stage
 ├─ Unit Test Job
 ├─ Integration Test Job
 └─ Security Scan Job
```

### Step

Job 안에서 실행되는 개별 명령이나 재사용 Action이다. 체크아웃, JDK 설정, `npm test`, `mvn test` 같은 작업이 Step이 된다.

### Runner, Agent, Executor

Job을 실제로 실행하는 머신 또는 실행 환경이다. 제품마다 이름이 다르지만 역할은 비슷하다.

- GitHub Actions: Runner
- Jenkins: Agent 또는 Node
- GitLab: Runner와 Executor

클라우드가 실행마다 제공하는 Hosted Runner와 조직이 직접 운영하는 Self-hosted Runner가 있다. Self-hosted Runner는 내부망과 특수 장비에 접근하기 쉽지만 보안 패치, 격리와 용량 관리 책임도 조직이 가진다.

### Artifact

빌드 결과로 만들어져 다음 단계나 배포에 사용하는 파일이다.

- JAR/WAR
- 프런트엔드 정적 파일
- Docker 이미지
- 설치 패키지
- 테스트 리포트

같은 소스에서 환경마다 다시 빌드하기보다 검증된 동일 Artifact를 승격시키면 환경별 결과 차이를 줄일 수 있다.

### Cache

의존성이나 빌드 중간 결과를 재사용해 실행 시간을 줄인다. Cache는 없어도 다시 만들 수 있는 데이터이고, Artifact는 배포하거나 보존할 결과물이라는 차이가 있다.

### Environment

애플리케이션이 실행되는 구분된 대상이다.

```text
Development → Test → Staging → Production
```

환경마다 설정과 비밀 값은 다를 수 있지만 Artifact 자체는 동일하게 유지하는 것이 이상적이다.

### Secret

배포 토큰, 클라우드 인증 정보처럼 공개 저장소에 넣어서는 안 되는 값이다. CI/CD 제품의 Secret 저장소나 짧은 수명의 자격 증명을 사용하고 로그에 출력되지 않도록 한다.

### Quality Gate

다음 단계로 진행하기 위해 충족해야 하는 품질 기준이다. 테스트 성공, 코드 커버리지, 정적 분석, 취약점 등급과 승인 여부 등이 될 수 있다.

### Rollback과 Roll Forward

- Rollback: 이전 정상 버전으로 되돌린다.
- Roll Forward: 문제를 수정한 새 버전을 빠르게 배포한다.

어떤 방식을 선택하든 데이터베이스 변경의 이전 버전 호환성과 배포 이력을 함께 고려해야 한다.

## 4. 기본 파이프라인 구조

### 순차 파이프라인

각 Stage를 정해진 순서로 실행한다.

```text
Build → Test → Package → Deploy
```

구조가 단순하고 실패 지점을 이해하기 쉽지만 독립적인 테스트까지 순차 실행하면 시간이 길어진다.

### 병렬 파이프라인

서로 의존하지 않는 Job을 동시에 실행한다.

```text
Build
  ├─ Unit Test
  ├─ Lint
  └─ Security Scan
        ↓
      Deploy
```

피드백은 빨라지지만 Runner 사용량과 비용이 증가할 수 있다.

### DAG 파이프라인

Stage 전체가 끝나기를 기다리지 않고 Job 간 실제 의존 관계를 그래프로 정의한다. GitLab의 `needs`나 GitHub Actions의 `needs` 같은 기능으로 표현할 수 있다.

```text
Build API ─→ Test API ─┐
                       ├→ Deploy
Build Web ─→ Test Web ─┘
```

대규모 파이프라인의 대기 시간을 줄일 수 있지만 의존성 설계가 복잡해진다.

## 5. 실행 시점에 따른 파이프라인 종류

### Branch Pipeline

브랜치에 Push할 때 실행한다. 기능 브랜치의 기본 품질을 빠르게 확인할 수 있지만 커밋이 많으면 실행량도 늘어난다.

### Pull/Merge Request Pipeline

리뷰 대상 변경사항을 검증한다. 대상 브랜치와 합쳐진 결과를 가정해 테스트하는 Merged Result 방식도 있다. 필수 검사를 통과해야 Merge할 수 있도록 보호 규칙과 연결한다.

### Main Branch Pipeline

기본 브랜치에 Merge된 커밋을 패키징하고 개발·스테이징 환경에 배포한다. 운영 배포 후보 Artifact를 만드는 기준점으로 사용하기 좋다.

### Tag 또는 Release Pipeline

`v1.2.0` 같은 태그나 Release가 만들어질 때 운영 배포를 실행한다. 버전과 배포 이력을 명확히 연결할 수 있다.

### Scheduled Pipeline

정해진 시간에 실행한다. 야간 전체 테스트, 의존성 검사, 백업 검증과 정기 배치에 활용한다. 오래 걸리는 테스트를 모든 커밋에 실행하지 않는 대신 실패 발견이 늦어질 수 있다.

### Manual Pipeline

사용자가 매개변수와 환경을 선택해 실행한다. 장애 복구, 특정 버전 재배포와 일회성 작업에 유용하지만 권한과 감사 로그가 필요하다.

## 6. 저장소 구조에 따른 파이프라인 종류

### 단일 프로젝트 파이프라인

하나의 저장소 안에서 하나의 애플리케이션을 빌드하고 배포한다. 가장 단순한 형태다.

### Parent–Child Pipeline

부모 파이프라인이 같은 프로젝트 안의 여러 자식 파이프라인을 실행한다. 모노레포에서 변경된 서비스만 골라 빌드하거나 거대한 설정을 도메인별로 분리할 때 유용하다.

```text
Parent
 ├─ Backend Child Pipeline
 ├─ Frontend Child Pipeline
 └─ Infrastructure Child Pipeline
```

### Multi-Project Pipeline

한 프로젝트의 배포가 다른 저장소의 파이프라인을 시작한다. 마이크로서비스, 공통 라이브러리, 인프라 저장소처럼 배포 단위가 나뉜 환경에서 사용한다. 프로젝트 간 버전 호환성과 실패 전파 정책을 명확히 해야 한다.

### Matrix Pipeline

운영체제, 런타임 버전이나 브라우저 조합을 행렬로 만들어 같은 테스트를 병렬 실행한다.

```text
Node 20 × Ubuntu
Node 20 × Windows
Node 22 × Ubuntu
Node 22 × Windows
```

라이브러리와 다중 플랫폼 제품에 유용하지만 조합 수가 빠르게 증가할 수 있다.

## 7. 배포 방식에 따른 파이프라인

파이프라인 종류와 배포 전략은 같은 개념이 아니다. 하나의 Release Pipeline 안에서 다음 전략 중 하나를 선택할 수 있다.

### Recreate

기존 버전을 중지한 뒤 새 버전을 시작한다. 단순하지만 배포 중 중단 시간이 생긴다.

### Rolling Deployment

인스턴스를 일부씩 새 버전으로 교체한다. 추가 환경 비용이 비교적 적지만 일정 시간 동안 두 버전이 함께 동작하므로 호환성이 필요하다.

### Blue–Green Deployment

현재 운영 환경과 동일한 새 환경을 준비한 뒤 트래픽을 한 번에 전환한다.

```text
Blue: 현재 운영 v1
Green: 신규 버전 v2 검증
→ 트래픽을 Green으로 전환
```

빠른 복구가 가능하지만 두 환경을 유지할 자원이 필요하고 데이터베이스 변경은 별도로 고려해야 한다.

### Canary Deployment

새 버전을 일부 사용자나 트래픽에만 먼저 노출하고 지표를 확인하며 비율을 늘린다. 위험을 작게 시작할 수 있지만 트래픽 제어, 관측성과 자동 판정이 필요하다.

### Feature Flag

코드는 미리 배포하되 기능 노출을 설정으로 제어한다. 배포와 기능 출시를 분리할 수 있다. 오래된 Flag를 제거하지 않으면 분기와 테스트 조합이 늘어난다.

## 8. GitHub Actions 예시

다음은 Pull Request와 `main` Push에서 빌드·테스트하고, `main`에서만 배포 Job을 실행하는 간단한 예다.

```yaml
name: CI CD

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: echo "검증된 Artifact 배포"
```

실제 파이프라인에서는 빌드 Artifact를 업로드하고 Deploy Job에서 같은 파일을 내려받아 배포해야 한다. 예제의 `echo`는 배포 위치만 보여 주는 자리다.

## 9. 좋은 파이프라인의 기준

### 빠른 피드백

Lint와 단위 테스트처럼 빠른 검사를 먼저 실행하고 오래 걸리는 검사는 병렬화하거나 별도 주기로 분리한다.

### 재현 가능성

도구와 의존성 버전을 고정하고 깨끗한 환경에서도 같은 결과가 나와야 한다. 개발자 PC에서만 성공하는 빌드는 자동화의 의미가 없다.

### 한 번 빌드하고 승격하기

환경마다 소스를 다시 빌드하지 않고 CI에서 만든 동일 Artifact를 테스트, 스테이징, 운영으로 승격한다.

### 최소 권한

PR 검증 Job에는 운영 배포 권한이 필요하지 않다. 환경별 Secret과 승인 규칙을 분리하고 장기 키보다 짧은 수명의 자격 증명을 우선한다.

### 실패가 명확해야 한다

오류를 무시하고 다음 단계로 진행하지 않는다. 어떤 Stage와 명령이 왜 실패했는지 로그와 알림에서 찾을 수 있어야 한다.

### 관측과 복구

배포 성공은 명령의 종료 코드만으로 결정되지 않는다. Health Check, 오류율, 지연 시간과 핵심 업무 지표를 확인하고 문제 발생 시 중단하거나 복구할 수 있어야 한다.

## 10. 자주 하는 실수

- CI와 CD를 도구 설치 자체로 생각한다.
- 테스트가 불안정한데 재실행으로만 통과시킨다.
- 환경마다 다른 코드를 빌드한다.
- 배포 토큰과 비밀번호를 YAML에 직접 작성한다.
- 모든 Job을 순차 실행해 피드백이 지나치게 느리다.
- 캐시와 Artifact를 구분하지 않는다.
- 데이터베이스 마이그레이션의 하위 호환성을 고려하지 않는다.
- 배포는 자동화했지만 모니터링과 복구는 준비하지 않는다.

## 정리

CI/CD는 특정 제품명이 아니라 변경사항을 작게 통합하고, 자동으로 검증하며, 신뢰할 수 있는 결과물을 안전하게 전달하는 방식이다.

```text
CI: 변경을 빠르게 통합하고 검증한다.
Delivery: 언제든 배포 가능한 상태로 만든다.
Deployment: 검증된 변경을 운영까지 자동 반영한다.
```

처음에는 `Build → Test → Package`의 작은 CI부터 시작해도 충분하다. 실패가 빠르고 명확하게 보이도록 만든 뒤 Artifact 관리, 환경 승인, 배포 검증과 점진적 배포를 순서대로 추가하는 편이 유지보수하기 좋은 파이프라인을 만든다.

## 참고 자료

- [GitHub 공식 문서: Workflows](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows)
- [GitLab 공식 문서: CI/CD Pipelines](https://docs.gitlab.com/ci/pipelines/)
- [Jenkins 공식 문서: Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [Jenkins 공식 문서: Deployment](https://www.jenkins.io/doc/pipeline/tour/deployment/)

