# FGG (Four Guardian Gods)

> 사신수(주작·청룡·백호·현무) 테마 + 렉시오 룰(2가 최강)의 온라인 멀티플레이 보드게임.
> 모바일 우선 + 데스크탑 호환.

---

## 게임 룰

### 타일 구성
- 4가지 사신수 문양 × 1~15 숫자 = 최대 60장
- 사신수 매핑: **주작**(해, sun) > **청룡**(달, moon) > **현무**(별, star) > **백호**(구름, cloud) — FGG 사용자 지정 대응

### 숫자 서열
**2 > 1 > 15 > 14 > 13 > … > 4 > 3** — 2가 최강, 1이 두 번째, 3이 최약.

### 게임 모드 (방 만들기 시 선택)
| 모드 | 3인 | 4인 | 5인 |
|---|---|---|---|
| **기본** (recommended) | 1~9, 12장씩 | 1~13, 13장씩 | 1~15, 12장씩 |
| **전체** (full) | 1~15, 20장씩 | 1~15, 15장씩 | 1~15, 12장씩 |

### 첫 선
매 라운드 **백호 3** (`cloud-3`, 가장 약한 타일) 보유자가 선입니다. 첫 턴에 백호 3을 꼭 낼 필요는 없습니다.
- 라운드 중 나머지 전원이 패스하면 마지막으로 낸 사람이 새 선이 되어 원하는 조합으로 시작합니다.

### 낼 수 있는 조합
- 1개 (싱글) / 2개 (페어) / 3개 (트리플) / 5개 (5장 콤보)
- **4개 절대 불가**

### 5장 콤보 족보 (낮음 → 높음)
1. 스트레이트 (연속 5장)
2. 플러시 (같은 사신수 5장)
3. 풀하우스 (트리플 + 페어)
4. 포카드 (같은 숫자 4장 + 1장)
5. 스트레이트플러시 (연속 + 같은 사신수)

### 스트레이트 특수 룰
- 유효: `1-2-3-4-5`, `2-3-4-5-6`, 일반 연속 5장, 최고 숫자 바로 뒤에 1이 붙는 형태
- 최고 숫자 뒤 연결: 기본 3인 `6-7-8-9-1`, 기본 4인 `10-11-12-13-1`, 기본 5인 및 full `12-13-14-15-1`
- 불가: 1 뒤에 2가 이어지는 `13-14-15-1-2`, `14-15-1-2-3`, `7-8-9-1-2` 등
- 강도: `1-2-3-4-5` > `2-3-4-5-6` > 최고 숫자 뒤에 1 > 일반(높은 숫자 순) > `3-4-5-6-7`
- 스트레이트 플러시도 같은 서열과 동률 규칙. 최강은 주작 `1-2-3-4-5`

### 동일 콤보 비교
- 싱글·페어·트리플·플러시는 가장 강한 타일(숫자 → 문양) 기준
- 풀하우스는 트리플 숫자, 포카드는 4장 숫자 기준
- 스트레이트 동률은 가장 강한 타일의 문양: `1-2-3-4-5`·`2-3-4-5-6`은 2, 최고 숫자 뒤 연결은 1, 일반은 최고 숫자
- 문양 서열: 주작 > 청룡 > 현무 > 백호

### 점수 계산
- 라운드 종료 시 남은 타일 개수 차이만큼 칩 교환
- **숫자 2 보유 시 페널티**: 남은 패 × 2^n (1개 ×2, 2개 ×4, 3개 ×8)

### 턴 진행
- 각 턴 **2분 제한**, 0초 도달 시 자동 패스
- 라운드 헤더 아래 진행 바 + 남은 시간 표시 (15초 이하 진홍 강조)

---

## 아키텍처

### 모노레포 (Turborepo + pnpm workspaces)

```
fgg-game/
├── packages/
│   └── game-logic/        # TypeScript 핵심 게임 로직 (서버와 공유, Jest 단위 테스트)
├── apps/
│   ├── server/            # Node.js + Socket.io 백엔드 (포트 3001)
│   ├── web/               # Next.js 14 프론트엔드 (포트 3000 / 개발: 3010)
│   └── flutter/           # Flutter 3.x 앱 (Dart로 게임 로직 재구현)
├── RULES.md               # 원본 룰 (참고용)
└── README.md
```

### 기술 스택

**공통**: TypeScript 5.x · pnpm · Turborepo

**백엔드 (`apps/server`)**: Node.js · Express · Socket.io 4.x · ts-node-dev

**웹 (`apps/web`)**:
- Next.js 14 App Router · TailwindCSS · Zustand · Socket.io-client
- `@dnd-kit/core` + `@dnd-kit/sortable` (손패 드래그 정렬)
- 모바일 우선 (가로화면 게임, 세로화면 메뉴)

**앱 (`apps/flutter`)**: Flutter 3.x · Dart · socket_io_client · Riverpod · go_router

### 서버 권위(Server Authoritative) 모델
- 클라이언트는 입력만 보내고, 게임 로직은 서버에서 검증/실행
- 클라이언트 측 즉시 검증(`detectCombination` + `canPlay`)은 UX용 (server roundtrip 전 즉각 피드백)
- 부정행위 방지

---

## 화면 라우트

| 라우트 | 화면 | 비고 |
|---|---|---|
| `/` | 로비 (닉네임 + 방 만들기/입장 + 모드 선택) | 사신수 floating + 카지노 골드 톤 |
| `/room/[roomId]` | 대기실 + 게임 보드 + 점수판 | gameState.phase에 따라 자동 전환 |
| `/guide` | 족보 가이드 (8 콤보 + 서열) | |
| `/tutorial` | 7-step 튜토리얼 | |
| `/test/[count]` | mock 게임 화면 (3/4/5인) | **dev/localhost 전용** (middleware로 production 차단) |

### `/test` 옵션
- `?turn=me` — 내 차례 시작
- `?first=1` — 첫 선 (lastPlay 없음)

---

## 모바일 게임 화면 layout (가로 모드)

```
┌──────────────────────────────────────┬──┐
│        ROUND 3 · 용현 차례 · #FGG     │↕ │ 정렬
│        ▓▓▓▓▓▓░░░░░ 78s              │  │
│ ┌──────┐                              │숫│
│ │ 용현 │       ╭─────────────╮       │자│
│ │🀫13  │      │              │       │  │
│ │💰14  │      │   Oval (3D   │       │💡│ 추천
│ └──────┘      │   perspective │       │  │
│ ┌──────┐      │   카지노 펠트)│       │  │
│ │NeoTaco│     │              │       │패│ 패스
│ │🀫13   │     │   9   9      │       │스│
│ │💰22   │     │   페어 ◇     │       │  │
│ └──────┘      │   NeoTaco    │       │✓ │ 내기
│ ┌──────┐     ╰─────────────╯        │  │
│ │ Mira │                              │  │
│ │🀫13  │                              │  │
│ │💰31  │                              │  │
│ └──────┘                              │  │
├──────────────────────────────────────┴──┤
│  나 🀫13 💰28                            │
│  [2][3][4][5][6][7][9][9][11][13][13][1][1] │ ← long-press drag로 정렬
└──────────────────────────────────────────┘
```

- **좌측**: 상대 정보 list (닉네임 / 🀫 패개수 / 💰 코인) — 컴팩트, 차례면 골드 ring + glow
- **가운데**: oval 테이블 (3D rotateX 58deg perspective) + 마지막 낸 패 + 콤보 라벨 + 누가 냈는지
- **우측 vertical 패널**: 정렬(숫자/문양) / 추천 💡 / 패스 / **체크 ✓** (내기)
- **하단**: 내 정보 + 손패 (sm size, 13장 가로 정렬, dnd-kit drag로 순서 변경)
- **portrait 모드**: 자동 회전 안내 모달 표시 (게임 화면 한정)

---

## 배포 인프라

### 현재 구성
```
[사용자] HTTPS
   ↓
[Vercel] fgg-game.vercel.app (Next.js)
   ↓ NEXT_PUBLIC_SERVER_URL (WSS)
[Tailscale Funnel] hyunwoo-am02.tail3d6bb4.ts.net
   ↓ NodePort 30001
[hw-01 K8s (k3s)] fgg-api Pod
```

| 항목 | 값 |
|---|---|
| Web 호스트 | Vercel `fgg-game.vercel.app` |
| 서버 호스트 | hw-01 K8s (k3s, Tailscale `100.80.145.71`) |
| 서버 공개 URL | `https://hyunwoo-am02.tail3d6bb4.ts.net` (Tailscale Funnel) |
| K8s 서비스 | NodePort 30001 → Pod 3001 |
| GitOps | `hyunwoo-company/k8s-helm` (`apps/fgg-api/`) → ArgoCD 자동 배포 |
| 이미지 | `ghcr.io/hyunwoo-company/fgg-server` (sha-XXXXXXX 자동 태그) |
| ArgoCD | `https://100.80.145.71:30443` |

### CI/CD 파이프라인
1. `apps/server/**` 또는 `packages/game-logic/**` 변경 push
2. GitHub Actions(`fgg-game/.github/workflows/build-server.yml`):
   - `build-and-push` job: GHCR에 `fgg-server:sha-XXXXXXX` + `latest` 빌드/푸시
   - `update-helm-chart` job: `k8s-helm` repo의 `apps/fgg-api/values.yaml` `image.tag`를 SHA로 갱신·commit·push (`HELM_REPO_TOKEN` secret 사용)
3. ArgoCD가 git diff 감지 → Pod 자동 재배포

### 도메인 취득 시 → Cloudflare Tunnel 전환 가이드
1. Cloudflare Zero Trust → Public Hostname 추가 (Service: `http://fgg-api:3001`)
2. `kubectl create secret generic cloudflared-token --from-literal=token=<TOKEN> -n lexio`
3. `k8s-helm/apps/fgg-api/values.yaml`: service.type ClusterIP, cloudflared.enabled: true
4. Vercel `NEXT_PUBLIC_SERVER_URL` → 새 도메인
5. `tailscale funnel off` (hw-01)

---

## 개발 워크플로

### 로컬 개발
```bash
# game-logic 테스트
cd packages/game-logic && pnpm test

# 서버 dev (3001)
pnpm --filter @fgg/server dev   # 또는 @lexio/server (구 패키지 이름)

# 웹 dev — IPv4 명시 (chrome MCP 호환)
cd apps/web && pnpm exec next dev -p 3010 -H 0.0.0.0
```

### 알려진 이슈
- **Next.js 14 dev hot reload chunk 누락** — Windows + pnpm symlink 환경에서 자주 발생.
  변경 후 페이지 안 뜨면 `.next` 삭제 + dev 재시작.
- **dev tools 모바일 시뮬 input 한계** — 마우스 wheel은 안 통하고 마우스 누른 채 드래그만 동작. 실제 디바이스에선 정상.

### 게임룰 검증 위치
- `packages/game-logic/src/constants.ts` — `TOP_NUMBER`(2), `FIRST_PLAYER_TILE`(cloud-3), 숫자·문양 서열
- `packages/game-logic/__tests__/` — 단위 테스트
- `packages/game-logic/src/validator.ts` — `detectCombination`
- `packages/game-logic/src/canPlay.ts` — 위계 비교
- `packages/game-logic/src/scorer.ts` — 점수 계산
- `apps/server/src/game/GameEngine.ts` — 서버 측 게임 진행 (위 함수들 사용)
- `apps/web/src/components/game/ActionBar.tsx` — 클라이언트 즉시 검증

### Socket.io 이벤트 스펙
- `ClientGameState.config`는 라운드 시작 설정을 유지하며, `hasPlayedThisRound`는 최초 선과 새 선 안내를 재접속 후에도 구분합니다.
- 정의 위치: `apps/server/src/socket/`
  - `roomHandler.ts`: `room:create`, `room:join`, `room:reconnect`
  - `gameHandler.ts`: `game:start`, `game:play`, `game:pass`, `game:ready`
- `room:create` payload: `{ playerName, mode? }` — mode='full' 또는 'recommended'

---

## E2E 테스트 전략 (3 layer)

| Layer | 위치 | 실행 |
|---|---|---|
| L1 게임로직 단위 | `packages/game-logic/__tests__/` | `pnpm test` |
| L2 서버 멀티플레이 봇 | `apps/server/test/e2e_bot_test.ts` | `ts-node` 실행 (서버 3001 띄운 상태) |
| L3 Flutter UI | `apps/flutter/integration_test/` | `patrol test --target ...` |

Patrol MCP: `.mcp.json` (프로젝트 루트) + `.claude/run-patrol` (런처). `patrol_cli` 전역 설치 + PATH 추가 필요.

---

## 디자인 시스템 (FGG)

### 컬러 토큰 (`globals.css`)
```css
--fgg-jujak: #C8323D       /* 주작, 火/南 — 빨강 */
--fgg-cheongryong: #2A8C56 /* 청룡, 木/東 — 초록 */
--fgg-baekho: #D88438      /* 백호, 金/西 — 황금 */
--fgg-hyunmu: #3A5A8C      /* 현무, 水/北 — 짙은 청 */

--fgg-gold / --fgg-gold-bright / --fgg-gold-deep   /* 카지노 골드 */
--fgg-bg-0/1/2 / --fgg-felt-0/1/2                  /* 배경 + 펠트 */
--fgg-text / --fgg-text-dim / --fgg-text-muted
--fgg-line / --fgg-line-strong                     /* 골드 라인 */
```

### 타입
- 디스플레이: Cormorant Garamond (`--fgg-font-display`)
- 본문: Pretendard / Noto Sans KR
- 숫자: Cormorant Garamond (lining)

### 타일 디자인 (`apps/web/src/components/tile/`)
- 3D 상아 몸체 PNG(3dsvg 렌더) 위에 앞면 overlay: 상아 여백 + 금선 액자 패널 안에 사신수별 AI 민화풍 배경 + 배경 제거한 사신수 일러스트
- 좌상단 + 우하단(180° 회전) 숫자 — 상아 숫자판 위 suit 색
- 최강 숫자(`TOP_NUMBER`, `tileAssets.ts`, 현재 2)는 특별 타일: 금빛 몸체 + 2중 금선·모서리 장식 + 금 숫자판 + glow + 전용 배경·'각성' 일러스트
- 에셋: `public/tiles/` (body / bg / bg-top / creature / creature-top, WebP)
- 숫자 색상: 주작=빨강 / 현무=초록 / 백호=검정(흰 호랑이용) / 청룡=푸른

---

## 향후 작업

- [ ] 사신수 60장 일러스트 (4 × 15 number 변형) — 사용자 자료 준비 중
- [x] Flutter 앱 측 매핑 swap 동기화
- [ ] 통합 테스트 (웹 ↔ Flutter 크로스 플레이)
- [ ] 도메인 취득 후 Cloudflare Tunnel 전환
- [ ] 앱 스토어 배포 (선택)
