import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fgg_app/game/models/tile.dart';
import 'package:fgg_app/widgets/tile_widget.dart';

void main() {
  for (final entry in {
    Suit.sun: '주작',
    Suit.moon: '청룡',
    Suit.star: '현무',
    Suit.cloud: '백호',
  }.entries) {
    testWidgets('tile visibly identifies ${entry.value}', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Center(
            child: TileWidget(
              tile: Tile(id: '${entry.key.name}-2', number: 2, suit: entry.key),
            ),
          ),
        ),
      );
      expect(find.text(entry.value), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }
}
