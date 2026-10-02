import { NUMBER_RANK, SUIT_RANK } from './constants';
import { calcSimpleStrength, getNumberRank, getSuitRank, getStrongestTile } from './comparator';
import type { Tile, TileCombination, TileNumber } from './types';

// maxNumber: 3인→9, 4인→13, 5인→15
export function detectCombination(tiles: Tile[], maxNumber: TileNumber = 15): TileCombination | null {
  if (tiles.length === 0 || tiles.length === 4) return null;

  if (tiles.length === 1) return makeSingle(tiles);
  if (tiles.length === 2) return makePair(tiles);
  if (tiles.length === 3) return makeTriple(tiles);
  if (tiles.length === 5) return makeFiveTile(tiles, maxNumber);

  return null;
}

function makeSingle(tiles: Tile[]): TileCombination {
  return { tiles, type: 'single', strength: calcSimpleStrength(tiles) };
}

function makePair(tiles: Tile[]): TileCombination | null {
  if (tiles[0].number !== tiles[1].number) return null;
  return { tiles, type: 'pair', strength: calcSimpleStrength(tiles) };
}

function makeTriple(tiles: Tile[]): TileCombination | null {
  const [a, b, c] = tiles;
  if (a.number !== b.number || b.number !== c.number) return null;
  return { tiles, type: 'triple', strength: calcSimpleStrength(tiles) };
}

function makeFiveTile(tiles: Tile[], maxNumber: TileNumber): TileCombination | null {
  // 우선순위: straightflush → fourcard → fullhouse → flush → straight
  return (
    tryStraightFlush(tiles, maxNumber) ??
    tryFourCard(tiles) ??
    tryFullHouse(tiles) ??
    tryFlush(tiles) ??
    tryStraight(tiles, maxNumber)
  );
}

function tryStraightFlush(tiles: Tile[], maxNumber: TileNumber): TileCombination | null {
  if (!isFlush(tiles)) return null;
  if (!isStraight(tiles, maxNumber)) return null;
  const strength = straightStrength(tiles, maxNumber);
  return { tiles, type: 'straightflush', strength };
}

function tryFourCard(tiles: Tile[]): TileCombination | null {
  const groups = groupByNumber(tiles);
  const fourGroup = groups.find((g) => g.length === 4);
  if (!fourGroup) return null;
  const strength = getNumberRank(fourGroup[0].number) * 10;
  return { tiles, type: 'fourcard', strength };
}

function tryFullHouse(tiles: Tile[]): TileCombination | null {
  const groups = groupByNumber(tiles);
  if (groups.length !== 2) return null;
  const tripleGroup = groups.find((g) => g.length === 3);
  if (!tripleGroup) return null;
  const strength = getNumberRank(tripleGroup[0].number) * 10;
  return { tiles, type: 'fullhouse', strength };
}

function tryFlush(tiles: Tile[]): TileCombination | null {
  if (!isFlush(tiles)) return null;
  const strongest = getStrongestTile(tiles);
  const strength = getNumberRank(strongest.number) * 10 + getSuitRank(strongest.suit);
  return { tiles, type: 'flush', strength };
}

function tryStraight(tiles: Tile[], maxNumber: TileNumber): TileCombination | null {
  if (!isStraight(tiles, maxNumber)) return null;
  const strength = straightStrength(tiles, maxNumber);
  return { tiles, type: 'straight', strength };
}

function isFlush(tiles: Tile[]): boolean {
  return tiles.every((t) => t.suit === tiles[0].suit);
}

function isStraight(tiles: Tile[], maxNumber: TileNumber): boolean {
  const sorted = sortByStraightOrder(tiles, maxNumber);
  if (!sorted) return false;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] !== 1) return false;
  }
  return true;
}

// 1은 최고 숫자 뒤에만 연결. 1·2가 함께 있으면 1-2-3-4-5만 허용.
function sortByStraightOrder(tiles: Tile[], maxNumber: TileNumber): number[] | null {
  const numbers = tiles.map((t) => t.number);
  const has1 = numbers.includes(1);
  const has2 = numbers.includes(2);

  // 1과 2가 모두 있는 경우 — 1-2-3-4-5만 허용
  if (has1 && has2) {
    const rest = [...numbers].sort((a, b) => a - b);
    if (rest.length !== 5) return null;
    if (rest[0] === 1 && rest[1] === 2 && rest[2] === 3 && rest[3] === 4 && rest[4] === 5) {
      // 유효성 검사에는 연속한 가상 위치를 사용
      return [-1, 0, 1, 2, 3];
    }
    return null;
  }

  if (has1) {
    // 1이 있고 2가 없으면 최고 숫자 뒤 연결 — 나머지 4개가 maxNumber-3 ~ maxNumber 연속이어야 함
    const others = numbers.filter((n) => n !== 1);
    const otherRanks = others.map((n) => NUMBER_RANK[n as TileNumber]);
    const maxRank = NUMBER_RANK[maxNumber];
    const expectedStart = maxRank - 3;
    const sorted = [...otherRanks].sort((a, b) => a - b);

    if (sorted[0] !== expectedStart) return null;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] !== 1) return null;
    }
    // 1을 맨 뒤에 붙임
    return [...sorted, maxRank + 1];
  }

  // 일반 스트레이트: 연속된 실제 숫자 값으로 비교
  const sorted = [...numbers].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] !== 1) return null;
  }
  return sorted;
}

// 조합 서열이 먼저, 동률이면 가장 강한 타일 문양으로 비교.
function straightStrength(tiles: Tile[], _maxNumber: TileNumber): number {
  const strongest = getStrongestTile(tiles);
  const has1 = tiles.some(t => t.number === 1);
  const has2 = tiles.some(t => t.number === 2);
  const seq = has1 && has2 ? 15 : has2 ? 14 : has1 ? 13 : NUMBER_RANK[strongest.number];
  return seq * 10 + SUIT_RANK[strongest.suit];
}

function groupByNumber(tiles: Tile[]): Tile[][] {
  const map = new Map<number, Tile[]>();
  for (const tile of tiles) {
    const group = map.get(tile.number) ?? [];
    group.push(tile);
    map.set(tile.number, group);
  }
  return Array.from(map.values());
}
