'use client';

import type { RoundResult, ClientGameState } from '@lexio/game-logic';

interface ScoreBoardProps {
  gameState: ClientGameState;
  roundResult: RoundResult;
  onReady: () => void;
  /** 인원 부족 등으로 게임이 종료된 상태 — '다음 라운드' 대신 '로비로' 표시 */
  isGameOver?: boolean;
  /** 게임 종료 사유 (있다면 헤더에 표시) */
  endReason?: string;
}

export function ScoreBoard({ gameState, roundResult, onReady, isGameOver, endReason }: ScoreBoardProps) {
  const playerMap = Object.fromEntries(gameState.players.map((p) => [p.id, p.name]));
  const winnerId = roundResult.exchanges.find((ex) => ex.amount > 0)?.toId;
  const winnerName = winnerId ? playerMap[winnerId] : null;
  const ranking = [...gameState.players].sort((a, b) => b.chips - a.chips);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 880,
        padding: '32px 28px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      {/* 비네트 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
          borderRadius: 16,
        }}
      />

      {/* 헤더 */}
      <header
        style={{
          position: 'relative',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div className="fgg-eyebrow">
          {isGameOver ? '게임 종료' : `Round ${gameState.roundNumber} · 정산`}
        </div>
        <h1
          className="fgg-display"
          style={{
            fontSize: 46,
            margin: 0,
            color: 'var(--fgg-gold-bright)',
            letterSpacing: '0.06em',
            textShadow: '0 0 22px rgba(242, 200, 120, 0.4)',
          }}
        >
          {isGameOver ? '최종 정산' : '라운드 정산'}
        </h1>
        {isGameOver && endReason && (
          <div style={{ fontSize: 12, color: 'var(--fgg-jujak)', marginTop: 4, fontStyle: 'italic' }}>
            ⚠ {endReason}
          </div>
        )}
        {winnerName && (
          <div style={{ fontSize: 13, color: 'var(--fgg-text-dim)', marginTop: 4 }}>
            🏆{' '}
            <span style={{ color: 'var(--fgg-gold-bright)', fontWeight: 600 }}>
              {winnerName}
            </span>
            님이 먼저 패를 비웠습니다
          </div>
        )}
      </header>

      {/* 페널티 (숫자 2 보유) */}
      {roundResult.penalizedPlayers.length > 0 && (
        <section
          className="fgg-panel"
          style={{
            position: 'relative',
            padding: '16px 20px',
            borderColor: 'rgba(200, 50, 61, 0.45)',
            background:
              'linear-gradient(180deg, rgba(60, 18, 22, 0.85) 0%, rgba(26, 12, 14, 0.85) 100%)',
          }}
        >
          <div
            className="fgg-eyebrow"
            style={{ color: 'var(--fgg-jujak, #C8323D)', marginBottom: 8 }}
          >
            Penalty · 숫자 2 보유
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {roundResult.penalizedPlayers.map((p) => (
              <li
                key={p.playerId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13,
                  color: '#FFB7BE',
                }}
              >
                <span style={{ color: 'var(--fgg-text)', fontWeight: 600 }}>
                  {playerMap[p.playerId]}
                </span>
                <span style={{ fontFamily: 'var(--fgg-font-num)' }}>
                  타일 {p.tileCount}개 ×{' '}
                  <span style={{ color: 'var(--fgg-jujak, #C8323D)', fontSize: 16, fontWeight: 600 }}>
                    {p.penaltyMultiplier}배
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 칩 교환 */}
      <section
        className="fgg-panel"
        style={{
          position: 'relative',
          padding: '16px 20px',
        }}
      >
        <div className="fgg-eyebrow" style={{ marginBottom: 10 }}>
          Chip Exchange · 칩 교환
        </div>
        {roundResult.exchanges.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: 'var(--fgg-text-muted)',
              fontStyle: 'italic',
              margin: 0,
              textAlign: 'center',
              padding: '12px 0',
            }}
          >
            교환 없음
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {roundResult.exchanges.map((ex, i) => (
              <li
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr auto',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  background: 'rgba(212, 166, 86, 0.04)',
                  border: '1px solid var(--fgg-line)',
                  borderRadius: 10,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    color: 'var(--fgg-jujak, #C8323D)',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}
                >
                  {playerMap[ex.fromId]}
                </span>
                <span style={{ color: 'var(--fgg-gold)', fontSize: 16 }}>→</span>
                <span style={{ color: '#5DDA9E', fontWeight: 600 }}>
                  {playerMap[ex.toId]}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--fgg-font-num)',
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--fgg-gold-bright)',
                    minWidth: 56,
                    textAlign: 'right',
                  }}
                >
                  {ex.amount}점
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 페널티 안내 */}
      <p
        style={{
          fontSize: 11,
          color: 'var(--fgg-text-muted)',
          textAlign: 'center',
          fontStyle: 'italic',
          margin: 0,
        }}
      >
        ※ 게임 종료 시 손에 든 ‘숫자 2’ 타일 1개당 남은 타일 개수가 2배로 계산됩니다 (2개 = 4배, 3개 = 8배)
      </p>

      {/* 칩 랭킹 */}
      <section
        className="fgg-panel"
        style={{
          position: 'relative',
          padding: '16px 20px',
        }}
      >
        <div className="fgg-eyebrow" style={{ marginBottom: 10 }}>
          Standings · 현재 칩
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ranking.map((p, i) => (
            <li
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                borderBottom:
                  i < ranking.length - 1 ? '1px solid rgba(212, 166, 86, 0.08)' : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--fgg-font-display)',
                  fontSize: 22,
                  color: i === 0 ? 'var(--fgg-gold-bright)' : 'var(--fgg-text-dim)',
                  textAlign: 'center',
                }}
              >
                {i === 0 ? '🥇' : `#${i + 1}`}
              </span>
              <span style={{ fontSize: 14, color: 'var(--fgg-text)' }}>{p.name}</span>
              <span
                style={{
                  fontFamily: 'var(--fgg-font-num)',
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--fgg-gold-bright)',
                }}
              >
                {p.chips}점
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 다음 라운드 / 로비로 */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <button
          onClick={onReady}
          className="fgg-btn fgg-btn--primary"
          style={{
            padding: '14px 36px',
            fontSize: 16,
            letterSpacing: '0.08em',
            fontFamily: 'var(--fgg-font-display)',
            minWidth: 240,
          }}
        >
          {isGameOver ? '로비로 돌아가기' : '다음 라운드 ▸'}
        </button>
      </div>
    </div>
  );
}
