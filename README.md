# FGG (Four Guardian Gods)

사신수(주작·청룡·백호·현무) 타일 × 포커 족보 클라이밍 보드게임 디지털 구현 — 렉시오 숫자·조합·점수 룰(2가 최강)에 FGG 사신수 테마를 적용한 버전. 사신수 대응은 사용자 지정: 주작(sun) > 청룡(moon) > 현무(star) > 백호(cloud).

- **3~5인** 온라인 멀티플레이어
- **웹 + Flutter 앱** 동시 지원 (크로스 플레이 가능)
- 게임 규칙: [RULES.md](./RULES.md)

---

## 요구사항

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Flutter 3.x (앱 개발 시)

---

## 설치

```bash
# 의존성 전체 설치
pnpm install
```

---

## 실행

### 백엔드 서버 (필수)

```bash
pnpm --filter @lexio/server dev
```

> 포트 3001에서 실행됩니다.

### 웹 프론트엔드

```bash
pnpm --filter @lexio/web dev
```

> 브라우저에서 http://localhost:3000 접속

### 둘 다 동시에 실행

```bash
pnpm dev
```

### Flutter 앱

```bash
cd apps/flutter
flutter run
```

---

## 테스트

```bash
# 게임 로직 단위 테스트
pnpm --filter @lexio/game-logic test

# 전체 테스트
pnpm test
```

---

## 빌드

```bash
# 게임 로직 빌드 (서버가 참조)
pnpm --filter @lexio/game-logic build

# 웹 프로덕션 빌드
pnpm --filter @lexio/web build

# 서버 프로덕션 빌드
pnpm --filter @lexio/server build
```

---

## 환경변수

### apps/web/.env.local

```env
# 서버 URL (기본값: http://localhost:3001)
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

### apps/server/.env

```env
# 클라이언트 Origin (기본값: http://localhost:3000)
CLIENT_ORIGIN=http://localhost:3000

# 포트 (기본값: 3001)
PORT=3001
```

---

## 프로젝트 구조

```
fgg/
├── packages/
│   └── game-logic/        # TypeScript 게임 로직 (서버·웹 공유)
│       └── src/
│           ├── types.ts
│           ├── constants.ts
│           ├── comparator.ts   # 타일·조합 서열 비교
│           ├── validator.ts    # 조합 판별
│           ├── canPlay.ts      # 낼 수 있는지 검사
│           ├── scorer.ts       # 점수 계산
│           └── deck.ts         # 덱 생성·배분
├── apps/
│   ├── server/            # Node.js + Socket.io 백엔드
│   │   └── src/
│   │       ├── game/GameEngine.ts
│   │       ├── room/
│   │       └── socket/
│   ├── web/               # Next.js 14 웹 프론트엔드
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── hooks/useSocket.ts
│   │       └── store/gameStore.ts
│   └── flutter/           # Flutter 앱 (진행 예정)
├── CLAUDE.md
├── RULES.md
├── TODOLIST.md
└── turbo.json
```

---

## Socket.io 이벤트

### 클라이언트 → 서버

| 이벤트 | 데이터 | 설명 |
|---|---|---|
| `room:create` | `{ playerName }` | 방 생성 |
| `room:join` | `{ roomId, playerName }` | 방 입장 |
| `game:start` | `{ roomId }` | 게임 시작 (방장만) |
| `game:play` | `{ roomId, tileIds[] }` | 타일 내기 |
| `game:pass` | `{ roomId }` | 패스 |
| `game:ready` | `{ roomId }` | 다음 라운드 준비 |

### 서버 → 클라이언트

| 이벤트 | 설명 |
|---|---|
| `room:created` | 방 생성 완료 |
| `room:updated` | 방 인원 변경 |
| `game:started` | 게임 시작 (내 패 포함) |
| `game:stateSync` | 턴 후 상태 동기화 |
| `game:invalid` | 잘못된 플레이 알림 |
| `game:roundEnd` | 라운드 종료 + 점수 |
