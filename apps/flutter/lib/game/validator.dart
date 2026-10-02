import 'models/tile.dart';
import 'models/tile_combination.dart';
import 'comparator.dart';
import 'constants.dart';

TileCombination? detectCombination(List<Tile> tiles, {int maxNumber = 15}) {
  if (tiles.isEmpty || tiles.length == 4) return null;
  if (tiles.length == 1) return _makeSingle(tiles);
  if (tiles.length == 2) return _makePair(tiles);
  if (tiles.length == 3) return _makeTriple(tiles);
  if (tiles.length == 5) return _makeFive(tiles, maxNumber);
  return null;
}

TileCombination _makeSingle(List<Tile> tiles) => TileCombination(
  tiles: tiles,
  type: CombinationType.single,
  strength: calcSimpleStrength(tiles),
);

TileCombination? _makePair(List<Tile> tiles) {
  if (tiles[0].number != tiles[1].number) return null;
  return TileCombination(
    tiles: tiles,
    type: CombinationType.pair,
    strength: calcSimpleStrength(tiles),
  );
}

TileCombination? _makeTriple(List<Tile> tiles) {
  if (tiles.any((t) => t.number != tiles[0].number)) return null;
  return TileCombination(
    tiles: tiles,
    type: CombinationType.triple,
    strength: calcSimpleStrength(tiles),
  );
}

TileCombination? _makeFive(List<Tile> tiles, int maxNumber) =>
    _tryStraightFlush(tiles, maxNumber) ??
    _tryFourCard(tiles) ??
    _tryFullHouse(tiles) ??
    _tryFlush(tiles) ??
    _tryStraight(tiles, maxNumber);

bool _isFlush(List<Tile> tiles) => tiles.every((t) => t.suit == tiles[0].suit);

bool _isStraight(List<Tile> tiles, int maxNumber) {
  final sorted = _sortByStraightOrder(tiles, maxNumber);
  if (sorted == null) return false;
  for (var i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] != 1) return false;
  }
  return true;
}

List<int>? _sortByStraightOrder(List<Tile> tiles, int maxNumber) {
  final numbers = tiles.map((t) => t.number).toList()..sort();
  final has1 = numbers.contains(1);
  final has2 = numbers.contains(topNumber);

  // 1과 2가 함께 있으면 1-2-3-4-5만 인정합니다.
  if (has1 && has2) {
    for (var i = 0; i < numbers.length; i++) {
      if (numbers[i] != i + 1) return null;
    }
    return numbers;
  }

  if (has1) {
    // 1은 이번 라운드의 최고 숫자 바로 뒤에만 붙습니다.
    final sorted = numbers.map((n) => n == 1 ? maxNumber + 1 : n).toList()
      ..sort();
    if (sorted.first != maxNumber - 3) return null;
    return sorted;
  }

  return numbers;
}

double _straightStrength(List<Tile> tiles) {
  final strongest = getStrongestTile(tiles);
  final seq =
      getNumberRank(strongest.number) +
      (strongest.number == topNumber && tiles.any((t) => t.number == 1)
          ? 1
          : 0);
  return seq * 10.0 + getSuitRank(strongest.suit);
}

Map<int, List<Tile>> _groupByNumber(List<Tile> tiles) {
  final map = <int, List<Tile>>{};
  for (final t in tiles) {
    map.putIfAbsent(t.number, () => []).add(t);
  }
  return map;
}

TileCombination? _tryStraightFlush(List<Tile> tiles, int maxNumber) {
  if (!_isFlush(tiles) || !_isStraight(tiles, maxNumber)) return null;
  return TileCombination(
    tiles: tiles,
    type: CombinationType.straightflush,
    strength: _straightStrength(tiles),
  );
}

TileCombination? _tryFourCard(List<Tile> tiles) {
  final groups = _groupByNumber(tiles).values.toList();
  final four = groups.where((g) => g.length == 4).firstOrNull;
  if (four == null) return null;
  return TileCombination(
    tiles: tiles,
    type: CombinationType.fourcard,
    strength: getNumberRank(four[0].number) * 10.0,
  );
}

TileCombination? _tryFullHouse(List<Tile> tiles) {
  final groups = _groupByNumber(tiles).values.toList();
  if (groups.length != 2) return null;
  final triple = groups.where((g) => g.length == 3).firstOrNull;
  if (triple == null) return null;
  return TileCombination(
    tiles: tiles,
    type: CombinationType.fullhouse,
    strength: getNumberRank(triple[0].number) * 10.0,
  );
}

TileCombination? _tryFlush(List<Tile> tiles) {
  if (!_isFlush(tiles)) return null;
  final strongest = getStrongestTile(tiles);
  final strength =
      getNumberRank(strongest.number) * 10.0 + getSuitRank(strongest.suit);
  return TileCombination(
    tiles: tiles,
    type: CombinationType.flush,
    strength: strength,
  );
}

TileCombination? _tryStraight(List<Tile> tiles, int maxNumber) {
  if (!_isStraight(tiles, maxNumber)) return null;
  return TileCombination(
    tiles: tiles,
    type: CombinationType.straight,
    strength: _straightStrength(tiles),
  );
}
