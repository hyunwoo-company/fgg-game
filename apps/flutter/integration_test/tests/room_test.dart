// 대기실 / 게임 화면 E2E 테스트 (Patrol 4.x)
//
// 실제 멀티플레이어 플로우는 서버 봇 스크립트로 검증:
//   apps/server/test/e2e_bot_test.ts

import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';
import 'package:fgg_app/main.dart' as app;

void main() {
  patrolTest(
    '앱 시작 시 로비가 먼저 표시된다',
    (PatrolIntegrationTester $) async {
      app.main();
      await $.pumpAndSettle();

      // room 화면으로 이동 전 로비가 표시되어야 함
      expect(find.text('FGG'), findsOneWidget);
    },
  );

  // TODO: 소켓 Mock 서버를 통한 대기실 진입 테스트
  // TODO: game:stateSync 이벤트 주입으로 게임 화면 전환 검증
  // TODO: 타일 선택 UI 상호작용 테스트
}
