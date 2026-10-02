import { detectCombination } from '../src/validator';
import { canPlay } from '../src/canPlay';
import type { Tile } from '../src/types';

const tile = (number: number, suit: string): Tile =>
  ({ id: `${suit}-${number}`, number, suit } as Tile);

describe('detectCombination', () => {
  describe('단수 (single)', () => {
    it('1개 타일은 항상 single', () => {
      const result = detectCombination([tile(7, 'moon')]);
      expect(result?.type).toBe('single');
    });
  });

  describe('페어 (pair)', () => {
    it('같은 숫자 2개는 pair', () => {
      const result = detectCombination([tile(5, 'sun'), tile(5, 'cloud')]);
      expect(result?.type).toBe('pair');
    });
    it('다른 숫자 2개는 null', () => {
      expect(detectCombination([tile(5, 'sun'), tile(6, 'sun')])).toBeNull();
    });
  });

  describe('트리플 (triple)', () => {
    it('같은 숫자 3개는 triple', () => {
      const result = detectCombination([tile(8, 'sun'), tile(8, 'moon'), tile(8, 'star')]);
      expect(result?.type).toBe('triple');
    });
    it('숫자가 다르면 null', () => {
      expect(detectCombination([tile(8, 'sun'), tile(8, 'moon'), tile(9, 'star')])).toBeNull();
    });
  });

  describe('4개는 항상 null', () => {
    it('4개 타일은 null', () => {
      const tiles = [tile(5, 'sun'), tile(5, 'moon'), tile(5, 'star'), tile(5, 'cloud')];
      expect(detectCombination(tiles)).toBeNull();
    });
  });

  describe('스트레이트 (straight)', () => {
    it('5개 연속 숫자는 straight', () => {
      const tiles = [tile(4, 'sun'), tile(5, 'moon'), tile(6, 'star'), tile(7, 'cloud'), tile(8, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('straight');
    });

    it('FGG: [2,3,4,5,6]은 valid straight ', () => {
      const tiles = [tile(2, 'sun'), tile(3, 'moon'), tile(4, 'star'), tile(5, 'cloud'), tile(6, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('straight');
    });

    it('FGG: [1,2,3,4,5]는 최강 straight로 valid', () => {
      const tiles = [tile(1, 'sun'), tile(2, 'moon'), tile(3, 'star'), tile(4, 'cloud'), tile(5, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('straight');
    });

    it('FGG: 1-2-3-4-5 > 12-13-14-15-1 — 강도 비교', () => {
      const aceHigh = detectCombination(
        [tile(12, 'sun'), tile(13, 'moon'), tile(14, 'star'), tile(15, 'cloud'), tile(1, 'sun')],
        15,
      );
      const aceLow = detectCombination(
        [tile(1, 'sun'), tile(2, 'moon'), tile(3, 'star'), tile(4, 'cloud'), tile(5, 'sun')],
        15,
      );
      expect(aceLow?.strength).toBeGreaterThan(aceHigh?.strength ?? 0);
    });

    it('FGG: 1-2-3-4-5 > 2-3-4-5-6', () => {
      const normal = detectCombination(
        [tile(2, 'sun'), tile(3, 'moon'), tile(4, 'star'), tile(5, 'cloud'), tile(6, 'sun')],
      );
      const aceLow = detectCombination(
        [tile(1, 'sun'), tile(2, 'moon'), tile(3, 'star'), tile(4, 'cloud'), tile(5, 'sun')],
      );
      expect(aceLow?.strength).toBeGreaterThan(normal?.strength ?? 0);
    });

    it('FGG: 1+2 포함 다른 조합 [1,2,4,5,6]은 invalid (함께 포함은 1-2-3-4-5만)', () => {
      const tiles = [tile(1, 'sun'), tile(2, 'moon'), tile(4, 'star'), tile(5, 'cloud'), tile(6, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).not.toBe('straight');
      expect(result?.type).not.toBe('straightflush');
    });

    it('4인 플레이(maxNumber=13): [10,11,12,13,1]은 valid straight (1이 ace high)', () => {
      const tiles = [tile(10, 'sun'), tile(11, 'moon'), tile(12, 'star'), tile(13, 'cloud'), tile(1, 'sun')];
      const result = detectCombination(tiles, 13);
      expect(result?.type).toBe('straight');
    });

    it('3인 플레이(maxNumber=9): [6,7,8,9,1]은 valid straight', () => {
      const tiles = [tile(6, 'sun'), tile(7, 'moon'), tile(8, 'star'), tile(9, 'cloud'), tile(1, 'sun')];
      const result = detectCombination(tiles, 9);
      expect(result?.type).toBe('straight');
    });

    it('5인 플레이(maxNumber=15): [12,13,14,15,1]은 valid straight', () => {
      const tiles = [tile(12, 'sun'), tile(13, 'moon'), tile(14, 'star'), tile(15, 'cloud'), tile(1, 'sun')];
      const result = detectCombination(tiles, 15);
      expect(result?.type).toBe('straight');
    });
  });

  describe('플러시 (flush)', () => {
    it('같은 문양 5개는 flush', () => {
      const tiles = [tile(3, 'sun'), tile(7, 'sun'), tile(9, 'sun'), tile(12, 'sun'), tile(1, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('flush');
    });
    it('문양이 섞이면 flush 아님', () => {
      const tiles = [tile(3, 'sun'), tile(7, 'sun'), tile(9, 'moon'), tile(12, 'sun'), tile(1, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).not.toBe('flush');
    });
  });

  describe('풀하우스 (fullhouse)', () => {
    it('페어+트리플은 fullhouse', () => {
      const tiles = [tile(5, 'sun'), tile(5, 'moon'), tile(9, 'sun'), tile(9, 'moon'), tile(9, 'star')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('fullhouse');
    });
  });

  describe('포카드 (fourcard)', () => {
    it('같은 숫자 4개+1개는 fourcard', () => {
      const tiles = [tile(7, 'sun'), tile(7, 'moon'), tile(7, 'star'), tile(7, 'cloud'), tile(3, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('fourcard');
    });
  });

  describe('스트레이트플러시 (straightflush)', () => {
    it('같은 문양 + 연속 숫자는 straightflush', () => {
      const tiles = [tile(4, 'sun'), tile(5, 'sun'), tile(6, 'sun'), tile(7, 'sun'), tile(8, 'sun')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('straightflush');
    });
  });

  describe('족보 우선순위', () => {
    it('straight+flush이면 straight보다 straightflush가 먼저', () => {
      const tiles = [tile(4, 'moon'), tile(5, 'moon'), tile(6, 'moon'), tile(7, 'moon'), tile(8, 'moon')];
      const result = detectCombination(tiles);
      expect(result?.type).toBe('straightflush');
    });
  });
});

describe('canPlay', () => {
  it('같은 개수, 더 높은 패만 낼 수 있음', () => {
    const lower = detectCombination([tile(5, 'sun')])!;
    const higher = detectCombination([tile(7, 'cloud')])!;
    expect(canPlay(higher, lower)).toBe(true);
    expect(canPlay(lower, higher)).toBe(false);
  });

  it('개수가 다르면 false', () => {
    const single = detectCombination([tile(5, 'sun')])!;
    const pair = detectCombination([tile(7, 'sun'), tile(7, 'moon')])!;
    expect(canPlay(pair, single)).toBe(false);
  });

  it('5개 조합: 더 높은 족보면 낼 수 있음', () => {
    const straight = detectCombination([tile(4, 'sun'), tile(5, 'moon'), tile(6, 'star'), tile(7, 'cloud'), tile(8, 'sun')])!;
    const flush = detectCombination([tile(3, 'moon'), tile(7, 'moon'), tile(9, 'moon'), tile(12, 'moon'), tile(1, 'moon')])!;
    expect(canPlay(flush, straight)).toBe(true);
    expect(canPlay(straight, flush)).toBe(false);
  });

  it('같은 페어 숫자면 주작 포함된 쪽이 이김', () => {
    const withSun = detectCombination([tile(7, 'sun'), tile(7, 'moon')])!;
    const withoutSun = detectCombination([tile(7, 'star'), tile(7, 'cloud')])!;
    expect(canPlay(withSun, withoutSun)).toBe(true);
    expect(canPlay(withoutSun, withSun)).toBe(false);
  });

  it('FGG: 단수 1이 단수 15보다 강함', () => {
    const one = detectCombination([tile(1, 'cloud')])!;
    const fifteen = detectCombination([tile(15, 'sun')])!;
    expect(canPlay(one, fifteen)).toBe(true);
    expect(canPlay(fifteen, one)).toBe(false);
  });
});
