import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fgg_app/main.dart';

void main() {
  testWidgets('앱이 정상 실행됨', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FggApp()));
    expect(find.text('FGG'), findsWidgets);
  });
}
