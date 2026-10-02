import { compareTiles, getNumberRank, getSuitRank } from '../src/comparator';
import type { Tile } from '../src/types';

const tile = (number: number, suit: string): Tile =>
  ({ id: `${suit}-${number}`, number, suit } as Tile);

describe('getNumberRank', () => {
  it('2가 최강', () => expect(getNumberRank(2)).toBe(14));
  it('1이 두 번째', () => expect(getNumberRank(1)).toBe(13));
  it('15가 세 번째', () => expect(getNumberRank(15)).toBe(12));
  it('3이 최약', () => expect(getNumberRank(3)).toBe(0));
});

describe('getSuitRank', () => {
  it('주작(sun)이 최강 (3)', () => expect(getSuitRank('sun')).toBe(3));
  it('백호(cloud)가 최약 (0)', () => expect(getSuitRank('cloud')).toBe(0));
});

describe('compareTiles', () => {
  it('숫자 서열: 주작3 < 백호4 (숫자가 우선)', () => {
    expect(compareTiles(tile(3, 'sun'), tile(4, 'cloud'))).toBeLessThan(0);
  });

  it('같은 숫자면 문양 서열로 비교', () => {
    expect(compareTiles(tile(5, 'sun'), tile(5, 'cloud'))).toBeGreaterThan(0);
  });

  it('주작2가 모든 타일 중 최강', () => {
    expect(compareTiles(tile(1, 'sun'), tile(15, 'sun'))).toBeGreaterThan(0);
    expect(compareTiles(tile(2, 'sun'), tile(1, 'sun'))).toBeGreaterThan(0);
    expect(compareTiles(tile(1, 'cloud'), tile(15, 'sun'))).toBeGreaterThan(0);
  });

  it('백호3이 모든 타일 중 최약', () => {
    expect(compareTiles(tile(3, 'cloud'), tile(3, 'star'))).toBeLessThan(0);
    expect(compareTiles(tile(3, 'cloud'), tile(4, 'cloud'))).toBeLessThan(0);
    expect(compareTiles(tile(3, 'sun'), tile(4, 'cloud'))).toBeLessThan(0);
  });
});
