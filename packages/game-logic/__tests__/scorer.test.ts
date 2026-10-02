import { calculateScoring, applyExchanges } from '../src/scorer';
import type { Player, Tile } from '../src/types';

const tile = (number: number, suit: string): Tile =>
  ({ id: `${suit}-${number}`, number, suit } as Tile);

const makePlayer = (id: string, hand: Tile[], chips = 20): Player => ({
  id, name: id, hand, chips, isConnected: true,
});

describe('calculateScoring (2 타일이 페널티)', () => {
  it('1등(타일 0개)은 모두에게 받음', () => {
    const players = [
      makePlayer('A', []),           // 1등: 0개
      makePlayer('B', [tile(5, 'sun'), tile(6, 'sun'), tile(7, 'sun')]), // 3개
      makePlayer('C', [tile(8, 'sun'), tile(9, 'sun')]),                  // 2개
    ];
    const result = calculateScoring(players);
    const aIncome = result.exchanges.filter((e) => e.toId === 'A').reduce((s, e) => s + e.amount, 0);
    expect(aIncome).toBe(5); // B에서 3 + C에서 2
  });

  it('FGG: 숫자 2 타일 1개 보유 시 타일 수 2배 페널티', () => {
    const players = [
      makePlayer('A', []),
      makePlayer('B', [tile(2, 'cloud'), tile(5, 'sun')]), // 2개지만 2 타일 보유 → 4로 계산
    ];
    const result = calculateScoring(players);
    const aIncome = result.exchanges.filter((e) => e.toId === 'A').reduce((s, e) => s + e.amount, 0);
    expect(aIncome).toBe(4);
  });

  it('FGG: 숫자 2 타일 2개 보유 시 4배 페널티', () => {
    const players = [
      makePlayer('A', []),
      makePlayer('B', [tile(2, 'cloud'), tile(2, 'star'), tile(5, 'sun')]), // 3개, 2타일 2개 → 3*4=12
    ];
    const result = calculateScoring(players);
    const aIncome = result.exchanges.filter((e) => e.toId === 'A').reduce((s, e) => s + e.amount, 0);
    expect(aIncome).toBe(12);
  });

  it('FGG: 페널티 플레이어 목록에 2 보유자 포함', () => {
    const players = [
      makePlayer('A', []),
      makePlayer('B', [tile(2, 'sun'), tile(5, 'moon')]),
    ];
    const result = calculateScoring(players);
    expect(result.penalizedPlayers.some((p) => p.playerId === 'B')).toBe(true);
  });

  it('FGG: 1 타일은 페널티 없음', () => {
    const players = [
      makePlayer('A', []),
      makePlayer('B', [tile(1, 'sun'), tile(1, 'moon'), tile(5, 'star')]),
    ];
    const result = calculateScoring(players);
    expect(result.penalizedPlayers.length).toBe(0);
    const aIncome = result.exchanges.filter((e) => e.toId === 'A').reduce((s, e) => s + e.amount, 0);
    expect(aIncome).toBe(3); // 페널티 없이 정확히 3개
  });
});

describe('applyExchanges', () => {
  it('교환 후 칩이 정확히 이동', () => {
    const players = [
      makePlayer('A', [], 20),
      makePlayer('B', [], 20),
    ];
    const exchanges = [{ fromId: 'B', toId: 'A', amount: 5 }];
    const result = applyExchanges(players, exchanges);
    expect(result.find((p) => p.id === 'A')?.chips).toBe(25);
    expect(result.find((p) => p.id === 'B')?.chips).toBe(15);
  });
});
