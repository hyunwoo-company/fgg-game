'use client';

import Link from 'next/link';
import type { Tile as TileType, Suit, TileNumber } from '@lexio/game-logic';
import { Tile } from '@/components/tile/Tile';
import { SUIT_META } from '@/components/tile/tileAssets';
import { StraightRules } from '@/components/guide/StraightRules';
import { NUMBER_RANK, TOP_NUMBER } from '@lexio/game-logic';

const SASIN = SUIT_META;

type ExampleTile = { number: TileNumber; suit: Suit };

interface HandRank {
  name: string;
  desc: string;
  sub?: string;
  example: ExampleTile[];
}

const HAND_RANKS: HandRank[] = [
  {
    name: '싱글',
    desc: '타일 1개. 더 높은 숫자 또는 같은 숫자라면 더 높은 문양.',
    sub: '최강패: 주작 2',
    example: [{ number: 2, suit: 'sun' }],
  },
  {
    name: '페어',
    desc: '같은 숫자 타일 2개. 같은 숫자 페어라면 가장 높은 문양 포함 쪽이 승.',
    sub: '최강패: 2 페어 (주작 2 포함)',
    example: [
      { number: 2, suit: 'sun' },
      { number: 2, suit: 'moon' },
    ],
  },
  {
    name: '트리플',
    desc: '같은 숫자 타일 3개. 더 높은 숫자가 승.',
    sub: '최강패: 2 트리플',
    example: [
      { number: 2, suit: 'sun' },
      { number: 2, suit: 'moon' },
      { number: 2, suit: 'star' },
    ],
  },
  {
    name: '스트레이트',
    desc: '문양 무관, 연속된 숫자 5개.',
    sub: '1은 최고 숫자 뒤에 붙을 수 있음(12-13-14-15-1). 1-2-3-4-5가 최강, 다음은 2-3-4-5-6. 1 뒤에 2 불가.',
    example: [
      { number: 5, suit: 'sun' },
      { number: 6, suit: 'moon' },
      { number: 7, suit: 'star' },
      { number: 8, suit: 'cloud' },
      { number: 9, suit: 'sun' },
    ],
  },
  {
    name: '플러시',
    desc: '같은 문양 5개. 가장 높은 숫자(같으면 문양 서열)로 승부.',
    example: [
      { number: 3, suit: 'sun' },
      { number: 7, suit: 'sun' },
      { number: 9, suit: 'sun' },
      { number: 11, suit: 'sun' },
      { number: 13, suit: 'sun' },
    ],
  },
  {
    name: '풀하우스',
    desc: '트리플(3) + 페어(2). 트리플 쪽 숫자가 높은 풀하우스가 승.',
    example: [
      { number: 8, suit: 'sun' },
      { number: 8, suit: 'moon' },
      { number: 8, suit: 'star' },
      { number: 12, suit: 'sun' },
      { number: 12, suit: 'moon' },
    ],
  },
  {
    name: '포카드',
    desc: '같은 숫자 4개 + 아무 타일 1개. 4장의 숫자가 높은 쪽이 승.',
    example: [
      { number: 9, suit: 'sun' },
      { number: 9, suit: 'moon' },
      { number: 9, suit: 'star' },
      { number: 9, suit: 'cloud' },
      { number: 5, suit: 'sun' },
    ],
  },
  {
    name: '스트레이트 플러시',
    desc: '같은 문양 + 연속된 숫자 5개. 5장 조합 중 최강.',
    sub: '최강패: 주작 1-2-3-4-5',
    example: [
      { number: 1, suit: 'sun' },
      { number: 2, suit: 'sun' },
      { number: 3, suit: 'sun' },
      { number: 4, suit: 'sun' },
      { number: 5, suit: 'sun' },
    ],
  },
];

const NUMBER_ORDER = (Object.keys(NUMBER_RANK).map(Number) as TileNumber[]).sort((a, b) => NUMBER_RANK[b] - NUMBER_RANK[a]);

export function GuideScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, rgba(212,166,86,0.06) 0%, transparent 55%), var(--fgg-bg-0)',
        color: 'var(--fgg-text)',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 28px',
          borderBottom: '1px solid var(--fgg-line)',
          background: 'var(--fgg-bg-1)',
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link
          href="/"
          className="fgg-btn"
          style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none' }}
        >
          ← 로비로
        </Link>
        <div>
          <div
            className="fgg-display"
            style={{ fontSize: 24, color: 'var(--fgg-text)', lineHeight: 1.1 }}
          >
            족보 가이드
          </div>
          <div className="fgg-eyebrow" style={{ marginTop: 4 }}>
            조합과 서열을 한눈에
          </div>
        </div>
      </header>

      <div style={{ padding: '28px 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Hierarchy explainer */}
        <div className="fgg-panel" style={{ padding: 22, marginBottom: 22 }}>
          <div className="fgg-eyebrow" style={{ marginBottom: 14 }}>
            서열 시스템
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--fgg-text-dim)',
                  marginBottom: 10,
                }}
              >
                숫자 서열 (높음 → 낮음)
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  alignItems: 'center',
                  fontFamily: 'var(--fgg-font-num)',
                  fontSize: 14,
                }}
              >
                {NUMBER_ORDER.map((n, i) => (
                  <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span
                      style={{
                        padding: '4px 9px',
                        background:
                          n === TOP_NUMBER
                            ? 'linear-gradient(180deg, var(--fgg-gold-bright), var(--fgg-gold-deep))'
                            : n === 3
                              ? 'rgba(120,120,140,0.18)'
                              : 'var(--fgg-bg-2)',
                        color:
                          n === TOP_NUMBER
                            ? '#1A1408'
                            : n === 3
                              ? 'var(--fgg-text-muted)'
                              : 'var(--fgg-text)',
                        borderRadius: 5,
                        fontWeight: n === TOP_NUMBER || n === 3 ? 700 : 500,
                        border:
                          n === TOP_NUMBER
                            ? '1px solid var(--fgg-gold-deep)'
                            : '1px solid var(--fgg-line)',
                      }}
                    >
                      {n}
                    </span>
                    {i < NUMBER_ORDER.length - 1 && (
                      <span
                        style={{
                          color: 'var(--fgg-text-muted)',
                          fontSize: 10,
                        }}
                      >
                        ›
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--fgg-text-muted)',
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: 'var(--fgg-gold-bright)', fontWeight: 600 }}>2가 가장 강하고 1이 두 번째, 3이 가장 약합니다</span>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--fgg-text-dim)',
                  marginBottom: 10,
                }}
              >
                문양 서열 (같은 숫자일 때)
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {(['sun', 'moon', 'star', 'cloud'] as Suit[]).map((s, i) => (
                  <span
                    key={s}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                  >
                    <Tile
                      tile={{ number: 7 as TileNumber, suit: s } as TileType}
                      size="sm"
                    />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span
                        style={{
                          fontFamily: 'var(--fgg-font-display)',
                          fontSize: 16,
                          color: s === 'cloud' ? 'var(--fgg-gold)' : SASIN[s].color,
                          fontWeight: 600,
                        }}
                      >
                        {SASIN[s].name}
                      </span>
                    </span>
                    {i < 3 && (
                      <span style={{ color: 'var(--fgg-text-muted)' }}>›</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--fgg-text-dim)' }}>기본 모드: 3인 1~9 · 4인 1~13 · 5인 1~15. 전체 모드: 모두 1~15.</p>

        {/* Combinations */}
        <div className="fgg-eyebrow" style={{ marginBottom: 14 }}>
          조합 (낮음 → 높음)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {HAND_RANKS.map((rank, i) => (
            <div
              key={rank.name}
              className="fgg-panel fgg-combo-card"
            >
              <div className="fgg-combo-card__num">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: 'var(--fgg-text)',
                    marginBottom: 6,
                    fontFamily: 'var(--fgg-font-display)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {rank.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--fgg-text-dim)',
                    lineHeight: 1.5,
                  }}
                >
                  {rank.desc}
                </div>
                {rank.sub && (
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--fgg-gold)',
                      marginTop: 6,
                      fontStyle: 'italic',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {rank.sub}
                  </div>
                )}
              </div>
              <div className="fgg-combo-card__tiles">
                {rank.example.map((t, j) => (
                  <Tile
                    key={j}
                    tile={{ number: t.number, suit: t.suit } as TileType}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <StraightRules />

        {/* Special rules */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            marginTop: 24,
          }}
        >
          {[
            {
              title: '4개는 못 냅니다',
              body: '한 번에 낼 수 있는 개수는 1, 2, 3, 5개. 4개는 절대 불가.',
            },
            {
              title: '같은 개수만',
              body: '앞사람이 낸 개수와 동일하게, 더 높은 서열로만 받아칠 수 있습니다.',
            },
            {
              title: '2 페널티 주의',
              body: '라운드 종료 시 손에 남은 2 한 장당 남은 패 ×2배 (2장 ×4, 3장 ×8)',
            },
            {
              title: '선 (先)',
              body: '매 라운드 가장 약한 타일인 백호 3 보유자가 선. 백호 3을 꼭 낼 필요는 없습니다.',
            },
            {
              title: '라운드 중 새 선',
              body: '나머지 모두가 패스하면 마지막에 패를 낸 사람이 새로운 선이 되어, 어떤 패든 다시 시작할 수 있습니다.',
            },
          ].map((s) => (
            <div
              key={s.title}
              style={{
                padding: 16,
                border: '1px dashed var(--fgg-gold-deep)',
                borderRadius: 12,
                background: 'rgba(212, 166, 86, 0.04)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--fgg-gold-bright)',
                  fontWeight: 700,
                  marginBottom: 8,
                  letterSpacing: '0.04em',
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--fgg-text-dim)',
                  lineHeight: 1.55,
                }}
              >
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
