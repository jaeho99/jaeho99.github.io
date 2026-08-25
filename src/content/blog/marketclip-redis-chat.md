---
title: "Redis Pub/Sub과 WebSocket으로 실시간 채팅 구현하기"
description: "MarketClip에서 채팅 메시지 발행, WebSocket 전달, DB 저장과 서버 재시작 복구를 어떻게 연결했는지 정리했습니다."
pubDate: 2026-08-25
tags: ["Redis", "WebSocket", "Spring Boot", "실시간 통신"]
---

중고거래 서비스 MarketClip에서는 상품마다 여러 채팅방이 생긴다. 메시지를 실시간으로 전달하는 것뿐 아니라 채팅 목록 갱신, 거래 요청, 상대방 퇴장 같은 이벤트도 함께 처리해야 했다.

이 글은 당시 구현한 Redis Pub/Sub 기반 채팅 구조를 지금의 관점에서 다시 분석한 기록이다.

## 전체 흐름

구현한 메시지 흐름은 다음과 같다.

```text
클라이언트
  ↓ STOMP 메시지
Spring WebSocket Controller
  ↓ publish
Redis ChannelTopic
  ↓ subscribe
RedisSubscriber
  ├─ WebSocket 구독자에게 전달
  ├─ 채팅방 목록 갱신 이벤트 전달
  └─ 일반 메시지를 MySQL에 저장
```

애플리케이션은 채팅방 ID마다 `ChannelTopic`을 만들었다. 발행자는 메시지를 Redis에 전달하고, 구독자는 메시지를 받아 적절한 WebSocket destination으로 전송했다.

```java
public void publish(ChannelTopic topic, ChatMessageReq message) {
    redisTemplate.convertAndSend(topic.getTopic(), message);
}
```

Publisher는 Redis에 메시지를 발행하는 역할만 담당한다. 실제 분기는 Subscriber에서 수행했다.

## 메시지 전달과 저장

Subscriber는 Redis 메시지를 `ChatMessageReq`로 역직렬화한다. 일반 채팅 메시지라면 해당 채팅방을 구독한 사용자에게 전달하고, 구매자와 판매자의 채팅방 목록에도 갱신 이벤트를 보낸다. 마지막으로 메시지를 DB에 저장한다.

```java
messagingTemplate.convertAndSend(
    "/sub/chat/room/" + roomMessage.getChatRoomId(),
    roomMessage
);

messagingTemplate.convertAndSend(
    "/sub/my-rooms/" + roomMessage.getPartnerId(),
    "CHAT_RELOAD"
);

chatMessageService.saveChatMessage(roomMessage);
```

채팅 메시지는 영속화했기 때문에 사용자가 다시 접속해도 이전 대화를 조회할 수 있었다. 채팅방 진입 시 상대방이 보낸 메시지를 읽음 처리하고, 채팅방 목록에는 읽지 않은 메시지 수와 마지막 메시지를 제공했다.

## 거래 이벤트도 같은 채널로 전달하기

중고거래에서는 채팅 화면 안에서 거래 요청과 수락·거절이 발생한다. 별도의 실시간 인프라를 추가하는 대신 기존 Pub/Sub 흐름에 거래 이벤트를 태웠다.

예를 들어 거래 요청이 발생하면 구매자와 판매자에게 서로 다른 화면 상태가 필요했다.

```text
판매자: 거래 요청을 보냈다는 상태
구매자: 거래를 수락하거나 거절할 수 있는 상태
```

그래서 동일한 거래 이벤트를 사용자 역할에 맞는 메시지로 바꿔 각각의 개인 채널에 전달했다. 거래 완료 시에는 선택되지 않은 다른 구매자들의 채팅 목록도 다시 불러오도록 했다.

## 서버 재시작 후 사라지는 토픽 문제

처음에는 `ChannelTopic`을 애플리케이션 메모리의 `Map`으로 관리했다. 하지만 서버가 재시작되면 Map이 비어 기존 채팅방의 메시지를 구독할 수 없었다.

해결 방법은 애플리케이션 시작 시 DB의 채팅방을 읽어 토픽과 리스너를 다시 등록하는 것이었다.

```java
@PostConstruct
private void init() {
    topics = new HashMap<>();
    List<ChatRoom> rooms = chatRoomRepository.findAll();

    for (ChatRoom room : rooms) {
        enterChatRoom(room.getId());
    }
}
```

이 경험을 통해 메모리 상태를 사용하는 기능은 항상 다음 질문이 필요하다는 것을 배웠다.

- 서버가 재시작되면 복구 가능한가?
- 서버가 여러 대라면 각 인스턴스의 상태는 일치하는가?
- 영속 데이터와 메모리 데이터 중 무엇이 기준인가?

## 지금 다시 설계한다면

당시 구조는 요구사항을 만족했지만 개선할 부분이 있다.

### 문자열 대신 명시적인 이벤트 모델

`CHAT_REMOVE`, `TRADE`, `TRADE_RELOAD` 같은 문자열과 조건문으로 이벤트를 분기했다. 지금이라면 이벤트 타입과 데이터 구조를 분리한다.

```java
public record ChatEvent(
    ChatEventType type,
    String roomId,
    Long senderId,
    Long receiverId,
    Object payload
) {}
```

이렇게 하면 이벤트 추가 시 기존 분기를 덜 건드리고, 생산자와 소비자 간 계약도 테스트하기 쉽다.

### 메시지 저장 실패에 대한 전략

당시에는 Subscriber가 WebSocket으로 전송한 뒤 DB에 메시지를 저장했다. 저장이 실패하면 사용자는 메시지를 봤지만 재접속 후에는 사라지는 불일치가 생길 수 있다.

지금이라면 다음 대안을 비교할 것이다.

- DB 저장 성공 후 이벤트 발행
- 메시지 큐의 내구성과 재시도 기능 사용
- 이벤트 ID를 통한 멱등 처리
- 실패 이벤트와 모니터링 지표 추가

Redis Pub/Sub은 빠르고 단순하지만 구독자가 놓친 메시지를 다시 전달해 주지는 않는다. 서비스가 요구하는 신뢰성 수준에 따라 Redis Streams나 Kafka 같은 다른 선택지도 검토해야 한다.

### 토픽 관리 단순화

채팅방마다 리스너를 등록하는 대신 하나의 패턴 토픽을 구독하고 메시지의 room ID로 라우팅하는 방식도 가능하다. 채팅방 수가 커질 때 리스너와 메모리 사용량이 어떻게 변하는지 측정한 뒤 선택해야 한다.

## 배운 점

실시간 채팅 구현에서 WebSocket 연결 자체보다 어려운 부분은 상태의 일관성이었다. 메시지, 읽음 여부, 상품 거래 상태와 사용자별 화면 갱신이 서로 연결되어 있기 때문이다.

이 프로젝트를 통해 실시간 기능은 단순한 전송 기술이 아니라 **도메인 상태와 실패 전략을 함께 설계하는 문제**라는 점을 배웠다.

> 관련 코드: [MarketClip Backend](https://github.com/jaeho99/7E7-BE/tree/main/src/main/java/com/seven/marketclip/chat)

