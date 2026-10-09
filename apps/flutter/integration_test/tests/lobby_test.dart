// 로비 화면 E2E 테스트 (Patrol 4.x)
// patrol test --target integration_test/patrol_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';
import 'package:fgg_app/main.dart' as app;

void main() {
  patrolTest(
    '로비 화면이 정상 표시된다',
    (PatrolIntegrationTester $) async {
      app.main();
      await $.pumpAndSettle();

      await $(find.text('FGG')).waitUntilVisible();
      expect(find.text('FGG'), findsOneWidget);
    },
  );

  patrolTest(
    '닉네임 입력 후 방 만들기 버튼이 보인다',
    (PatrolIntegrationTester $) async {
      app.main();
      await $.pumpAndSettle();

      await $(find.byType(TextField)).first.enterText('테스트유저');
      await $.pumpAndSettle();

      expect(find.text('방 만들기'), findsOneWidget);
    },
  );

  patrolTest(
    '방 입장 탭 시 코드 입력 필드가 나타난다',
    (PatrolIntegrationTester $) async {
      app.main();
      await $.pumpAndSettle();

      await $(find.text('방 입장')).tap();
      await $.pumpAndSettle();

      expect(find.byType(TextField), findsAtLeastNWidgets(2));
    },
  );

  patrolTest(
    '닉네임 없이 방 만들기 시 화면 이동 없음',
    (PatrolIntegrationTester $) async {
      app.main();
      await $.pumpAndSettle();

      await $(find.text('방 만들기')).tap();
      await $.pumpAndSettle();

      // 여전히 로비 화면 유지
      expect(find.text('FGG'), findsOneWidget);
    },
  );
}
