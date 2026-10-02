import 'package:flutter_test/flutter_test.dart';
import 'package:lexio_app/game/comparator.dart';
import 'package:lexio_app/game/constants.dart';
import 'package:lexio_app/game/models/tile.dart';
import 'package:lexio_app/game/models/tile_combination.dart';
import 'package:lexio_app/game/validator.dart';

List<Tile> hand(List<int> numbers, {Suit? suit, Suit topSuit = Suit.sun}) {
  if (numbers.isEmpty) return [];
  final strongest = numbers.reduce(
    (a, b) => numberRank[a]! > numberRank[b]! ? a : b,
  );
  return [
    for (var i = 0; i < numbers.length; i++)
      Tile(
        id: 'tile-$i',
        number: numbers[i],
        suit:
            suit ??
            (i == numbers.indexOf(strongest) ? topSuit : Suit.values[i % 4]),
      ),
  ];
}

void main() {
  test('deity labels retain the wire keys and suit ranks', () {
    expect(suitLabel, {
      Suit.sun: '주작',
      Suit.moon: '청룡',
      Suit.star: '현무',
      Suit.cloud: '백호',
    });
    expect(suitRank, {Suit.sun: 3, Suit.moon: 2, Suit.star: 1, Suit.cloud: 0});
    for (final suit in Suit.values) {
      final tile = Tile(id: '${suit.name}-3', number: 3, suit: suit);
      expect(tile.toJson()['suit'], suit.name);
      expect(Tile.fromJson(tile.toJson()).suit, suit);
    }
  });

  test('single numbers follow 2 > 1 > 15 ... > 3', () {
    expect(topNumber, 2);
    final numbers = [2, 1, for (var n = 15; n >= 3; n--) n];
    for (var i = 1; i < numbers.length; i++) {
      final stronger = detectCombination(hand([numbers[i - 1]]))!;
      final weaker = detectCombination(hand([numbers[i]]))!;
      expect(compareCombinations(stronger, weaker), greaterThan(0));
    }
  });

  for (final maxNumber in [9, 13, 15]) {
    final high1 = [for (var n = maxNumber - 3; n <= maxNumber; n++) n, 1];
    final normalHigh = [for (var n = maxNumber - 4; n <= maxNumber; n++) n];
    final sequences = [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
      high1,
      normalHigh,
      [3, 4, 5, 6, 7],
    ];
    final ranks = [15, 14, 13, numberRank[maxNumber]!, 4];

    for (var i = 0; i < sequences.length; i++) {
      for (final suit in Suit.values) {
        test('max $maxNumber ${sequences[i]} strongest $suit', () {
          final combination = detectCombination(
            hand(sequences[i].reversed.toList(), topSuit: suit),
            maxNumber: maxNumber,
          )!;
          expect(combination.type, CombinationType.straight);
          expect(combination.strength, ranks[i] * 10 + suitRank[suit]!);
        });
        test('max $maxNumber ${sequences[i]} flush $suit', () {
          final combination = detectCombination(
            hand(sequences[i], suit: suit),
            maxNumber: maxNumber,
          )!;
          expect(combination.type, CombinationType.straightflush);
          expect(combination.strength, ranks[i] * 10 + suitRank[suit]!);
        });
      }
    }

    test('max $maxNumber sequence order takes priority over suit', () {
      for (var i = 1; i < sequences.length; i++) {
        final stronger = detectCombination(
          hand(sequences[i - 1], topSuit: Suit.cloud),
          maxNumber: maxNumber,
        )!;
        final weaker = detectCombination(
          hand(sequences[i], topSuit: Suit.sun),
          maxNumber: maxNumber,
        )!;
        expect(compareCombinations(stronger, weaker), greaterThan(0));
        final strongerFlush = detectCombination(
          hand(sequences[i - 1], suit: Suit.cloud),
          maxNumber: maxNumber,
        )!;
        final weakerFlush = detectCombination(
          hand(sequences[i], suit: Suit.sun),
          maxNumber: maxNumber,
        )!;
        expect(compareCombinations(strongerFlush, weakerFlush), greaterThan(0));
      }
    });

    for (final numbers in [
      [maxNumber - 2, maxNumber - 1, maxNumber, 1, 2],
      [maxNumber - 1, maxNumber, 1, 2, 3],
      [1, 2, 4, 5, 6],
      [maxNumber - 4, maxNumber - 3, maxNumber - 2, maxNumber - 1, 1],
      [3, 4, 5, 6, 6],
    ]) {
      test('max $maxNumber rejects non-straight $numbers', () {
        expect(detectCombination(hand(numbers), maxNumber: maxNumber), isNull);
        // Same-suit invalid sequences remain a valid flush, not a straight flush.
        expect(
          detectCombination(
            hand(numbers, suit: Suit.sun),
            maxNumber: maxNumber,
          )!.type,
          CombinationType.flush,
        );
      });
    }
  }

  test('same sequence uses strongest tile suit as tie-break', () {
    for (final numbers in [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
      [12, 13, 14, 15, 1],
      [3, 4, 5, 6, 7],
    ]) {
      for (var i = 1; i < Suit.values.length; i++) {
        expect(
          compareCombinations(
            detectCombination(hand(numbers, topSuit: Suit.values[i - 1]))!,
            detectCombination(hand(numbers, topSuit: Suit.values[i]))!,
          ),
          greaterThan(0),
        );
      }
    }
  });

  test('other combination strengths match the shared TS formula', () {
    for (final n in [2, 1, 15, 3]) {
      for (final count in [1, 2, 3]) {
        final combination = detectCombination(hand(List.filled(count, n)))!;
        expect(combination.strength, numberRank[n]! * 10 + 3);
      }
      final house = detectCombination(hand([n, n, n, 4, 4]))!;
      expect(house.type, CombinationType.fullhouse);
      expect(house.strength, numberRank[n]! * 10);
      final four = detectCombination(hand([n, n, n, n, 4]))!;
      expect(four.type, CombinationType.fourcard);
      expect(four.strength, numberRank[n]! * 10);
    }
    for (final suit in Suit.values) {
      final stronger = detectCombination(hand([2, 3, 5, 8, 11], suit: suit))!;
      final weaker = detectCombination(hand([1, 3, 5, 8, 11], suit: suit))!;
      expect(stronger.type, CombinationType.flush);
      expect(stronger.strength, 140 + suitRank[suit]!);
      expect(weaker.strength, 130 + suitRank[suit]!);
      expect(compareCombinations(stronger, weaker), greaterThan(0));
    }
  });

  test('four tiles and unsupported tile counts are invalid', () {
    for (final count in [0, 4, 6]) {
      expect(detectCombination(hand(List.filled(count, 3))), isNull);
    }
  });
}
