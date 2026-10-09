# TODOLIST

## 완료
- [x] Phase 0: Turborepo 모노레포 초기화
- [x] Phase 1: game-logic 코어 구현 + 단위 테스트 (36개)
- [x] Phase 2: Node.js + Socket.io 백엔드
- [x] Phase 3: Next.js 웹 UI + Socket 연동
  - [x] 3D 마작패 디자인 (CSS 두께 레이어)
  - [x] 모바일 반응형 (100dvh, 가로 스크롤 손패)
  - [x] 새로고침 재연결 (stable clientId + room:reconnect)
- [x] Phase 5: Flutter 앱 — 게임 로직 구현
- [x] Phase 6: Flutter 앱 — UI 구현 (로비/대기실/게임/점수)
- [x] E2E 테스트 설정 (Patrol 4.x + Patrol MCP)
- [x] GitHub 저장소 생성 및 초기 푸시 (hyunwoo-company/fgg-game)
- [x] Vercel 웹 배포 완료 → https://fgg-game.vercel.app

---

## 진행 예정

### Phase 4: 백엔드 배포 ← 결정 필요
- [ ] 백엔드 호스팅 방식 결정 (아래 "결정 사항" 참고)
- [ ] `NEXT_PUBLIC_SERVER_URL` 환경변수 업데이트 후 Vercel Redeploy
- [ ] Flutter 앱의 서버 URL 코드 업데이트

### Phase 7: 통합 테스트 및 폴리싱
- [ ] 실제 멀티플레이 통합 테스트 (웹 ↔ Flutter 크로스 플레이)
- [ ] 연결 끊김 처리 검증
- [ ] 타일 선택 애니메이션 (Flutter: AnimatedContainer)
- [ ] 효과음 추가 (선택)

### Phase 8: 앱 배포 ← 결정 필요
- [ ] Android APK 빌드 + 배포 방식 결정
- [ ] iOS 빌드 방식 결정 (GitHub Actions macOS runner 사용 여부)
