import type { Tile, TileNumber, Suit } from '@fgg/game-logic';
import { Tile as TileView } from '@/components/tile/Tile';

export const STRAIGHT_EXAMPLES: { numbers: TileNumber[]; label: string; valid: boolean }[] = [
  { numbers: [1, 2, 3, 4, 5], label: '최강', valid: true },
  { numbers: [2, 3, 4, 5, 6], label: '두 번째', valid: true },
  { numbers: [12, 13, 14, 15, 1], label: '최고 숫자 뒤에 1', valid: true },
  { numbers: [11, 12, 13, 14, 15], label: '일반', valid: true },
  { numbers: [3, 4, 5, 6, 7], label: '최약', valid: true },
  { numbers: [13, 14, 15, 1, 2], label: '1 뒤에 2 불가', valid: false },
  { numbers: [14, 15, 1, 2, 3], label: '1 뒤에 2 불가', valid: false },
];

export function straightExampleTiles(numbers: TileNumber[]): Tile[] {
  const suits: Suit[] = ['moon', 'sun', 'star', 'cloud', 'moon'];
  return numbers.map((number, i) => ({ id: `example-${number}-${i}`, number, suit: suits[i] }));
}

export function StraightRules() {
  return (
    <div className="fgg-panel" style={{ padding: 14, marginTop: 18, width: '100%', minWidth: 0 }}>
      <div className="fgg-eyebrow" style={{ marginBottom: 10 }}>스트레이트 서열 · 강함 → 약함</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STRAIGHT_EXAMPLES.map(example => (
          <div key={example.numbers.join('-')} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {straightExampleTiles(example.numbers).map(tile => (
                <div key={tile.id} style={{ transform: 'scale(0.72)', transformOrigin: 'left top', marginRight: -11, marginBottom: -16 }}>
                  <TileView tile={tile} size="sm" />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 10, color: example.valid ? 'var(--fgg-gold)' : '#FF8088' }}>
              {example.valid ? '✓' : '✗'} {example.numbers.join('-')} · {example.label}
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--fgg-text-dim)', lineHeight: 1.6, marginBottom: 0 }}>
        1은 그 판의 최고 숫자 바로 뒤에만 붙습니다.<br />
        기본 3인: 6-7-8-9-1 · 4인: 10-11-12-13-1 · 5인 및 전체 모드: 12-13-14-15-1<br />
        같은 서열은 가장 강한 타일 문양으로 비교합니다. 1-2-3-4-5·2-3-4-5-6은 2, 최고 숫자 뒤 연결은 1, 일반은 가장 높은 숫자 기준입니다.
      </p>
    </div>
  );
}
