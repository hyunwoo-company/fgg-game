import { NUMBER_RANK, SUIT_LABEL, SUIT_RANK } from '../src/constants';
import { findFirstPlayer } from '../src/deck';
import { detectCombination } from '../src/validator';
import { calculateScoring } from '../src/scorer';
import type { Suit, Tile, TileNumber } from '../src/types';

const suits: Suit[] = ['cloud', 'star', 'moon', 'sun'];
const tile = (number: TileNumber, suit: Suit = 'cloud'): Tile => ({ id: `${suit}-${number}`, number, suit });
const run = (numbers: TileNumber[], suit?: Suit): Tile[] => numbers.map((n, i) => tile(n, suit ?? suits[i % 4]));
const strength = (numbers: TileNumber[], max: TileNumber = 15, suit?: Suit) => detectCombination(run(numbers, suit), max)!.strength;

describe('렉시오 확정 규칙', () => {
  it('숫자와 사신수 서열', () => {
    expect([2, 1, 15, 3].map(n => NUMBER_RANK[n as TileNumber])).toEqual([14, 13, 12, 0]);
    expect(SUIT_LABEL).toEqual({ sun: '주작', moon: '청룡', star: '현무', cloud: '백호' });
    expect(suits.map(s => SUIT_RANK[s])).toEqual([0, 1, 2, 3]);
  });
  it('백호 3 보유자가 선이며 백호 2와 청룡 3은 선이 아님', () => {
    expect(findFirstPlayer([[tile(2)], [tile(3, 'moon')], [tile(3)]])).toBe(2);
  });
  it.each([1, 2, 3])('2를 %i장 남기면 2의 n제곱 배율', count => {
    const hand = [...suits.slice(0, count).map(s => tile(2, s)), tile(1)];
    const result = calculateScoring([{ id: 'p', name: 'p', hand, chips: 60, isConnected: true }]);
    expect(result.penalizedPlayers[0]).toEqual({ playerId: 'p', tileCount: hand.length * 2 ** count, penaltyMultiplier: 2 ** count });
  });
  it('1은 페널티 없음', () => {
    expect(calculateScoring([{ id: 'p', name: 'p', hand: [tile(1)], chips: 60, isConnected: true }]).penalizedPlayers).toEqual([]);
  });
  it.each<[TileNumber[], TileNumber]>([
    [[1, 2, 3, 4, 5], 15], [[2, 3, 4, 5, 6], 15], [[12, 13, 14, 15, 1], 15],
    [[10, 11, 12, 13, 1], 13], [[6, 7, 8, 9, 1], 9], [[3, 4, 5, 6, 7], 15],
  ])('유효한 스트레이트 %s (최고숫자 %s)', (numbers, max) => {
    expect(detectCombination(run(numbers), max)?.type).toBe('straight');
  });
  it.each<[TileNumber[], TileNumber]>([
    [[13, 14, 15, 1, 2], 15], [[14, 15, 1, 2, 3], 15], [[7, 8, 9, 1, 2], 9],
    [[1, 2, 4, 5, 6], 15], [[11, 12, 13, 14, 1], 15],
  ])('무효 스트레이트 %s', (numbers, max) => expect(detectCombination(run(numbers), max)).toBeNull());
  it('전체 스트레이트 및 스트레이트 플러시 순서', () => {
    const sequences: TileNumber[][] = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [12, 13, 14, 15, 1], [11, 12, 13, 14, 15], [3, 4, 5, 6, 7]];
    for (const suit of [undefined, 'sun', 'cloud'] as const) {
      const ranks = sequences.map(seq => strength(seq, 15, suit));
      ranks.slice(1).forEach((rank, i) => expect(ranks[i]).toBeGreaterThan(rank));
    }
    expect(strength(sequences[0], 15, 'sun')).toBe(153);
  });
  it('3인 스트레이트 순서', () => {
    expect(strength([2, 3, 4, 5, 6], 9)).toBeGreaterThan(strength([6, 7, 8, 9, 1], 9));
    expect(strength([6, 7, 8, 9, 1], 9)).toBeGreaterThan(strength([5, 6, 7, 8, 9], 9));
  });
  it.each<TileNumber[]>([[1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [12, 13, 14, 15, 1], [3, 4, 5, 6, 7]])('동률은 가장 강한 타일 문양 %s', (...numbers) => {
    const tiles = run(numbers);
    const top = tiles.reduce((a, b) => NUMBER_RANK[a.number] > NUMBER_RANK[b.number] ? a : b);
    const withSuit = (suit: Suit) => tiles.map(t => t === top ? tile(t.number, suit) : t);
    expect(detectCombination(withSuit('sun'))!.strength).toBeGreaterThan(detectCombination(withSuit('cloud'))!.strength);
  });
  it('문양보다 스트레이트 서열 우선', () => {
    expect(strength([1, 2, 3, 4, 5])).toBeGreaterThan(detectCombination([tile(2, 'sun'), tile(3), tile(4, 'moon'), tile(5, 'star'), tile(6)])!.strength);
  });
  it('페어, 트리플, 풀하우스, 포카드, 플러시의 2가 1보다 높음', () => {
    const forms = (n: TileNumber) => [
      [tile(n)], [tile(n), tile(n, 'sun')], [tile(n), tile(n, 'sun'), tile(n, 'moon')],
      [tile(n), tile(n, 'sun'), tile(n, 'moon'), tile(8), tile(8, 'sun')],
      [...suits.map(s => tile(n, s)), tile(8)], run([3, 5, 8, 11, n], 'sun'),
    ];
    forms(2).forEach((tiles, i) => expect(detectCombination(tiles)!.strength).toBeGreaterThan(detectCombination(forms(1)[i])!.strength));
  });
});
