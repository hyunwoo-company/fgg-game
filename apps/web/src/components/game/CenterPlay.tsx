'use client';

import { Tile } from '@/components/tile/Tile';
import type { TileCombination } from '@fgg/game-logic';

const COMBINATION_LABEL: Record<string, string> = {
  single: '싱글', pair: '페어', triple: '트리플',
  straight: '스트레이트', flush: '플러시', fullhouse: '풀하우스',
  fourcard: '포카드', straightflush: '스트레이트 플러시',
};

interface CenterPlayProps {
  lastPlay: TileCombination | null;
  lastPlayerId: string | null;
  playerNames: Record<string, string>;
  currentPlayerName: string;
}

export function CenterPlay({ lastPlay, lastPlayerId, playerNames, currentPlayerName }: CenterPlayProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      minHeight: 140,
      justifyContent: 'center',
      width: '100%',
      maxWidth: 500,
    }}>
      {/* 현재 차례 표시 */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--fgg-line-strong, rgba(212,166,86,0.4))',
        borderRadius: 20,
        padding: '4px 14px',
        fontSize: 13,
        color: '#fcd34d',
        fontWeight: 700,
      }}>
        {currentPlayerName}의 차례
      </div>

      {/* 낸 패 영역 */}
      {lastPlay ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontSize: 11,
            color: '#94a3b8',
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}>
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
              {playerNames[lastPlayerId ?? ''] ?? '?'}
            </span>
            <span>—</span>
            <span style={{
              background: 'rgba(212,166,86,0.15)',
              border: '1px solid rgba(212,166,86,0.4)',
              borderRadius: 6,
              padding: '1px 7px',
              color: '#F2C878',
              fontWeight: 700,
              fontSize: 10,
            }}>
              {COMBINATION_LABEL[lastPlay.type]}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {lastPlay.tiles.map((tile) => (
              <Tile key={tile.id} tile={tile} disabled size="md" />
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 160,
          height: 80,
          borderRadius: 12,
          border: '2px dashed rgba(255,255,255,0.1)',
          color: '#475569',
          fontSize: 13,
        }}>
          패를 내 주세요
        </div>
      )}
    </div>
  );
}
