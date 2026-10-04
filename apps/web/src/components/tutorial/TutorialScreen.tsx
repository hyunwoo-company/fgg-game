'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Tile as TileType, Suit, TileNumber } from '@lexio/game-logic';
import { Tile } from '@/components/tile/Tile';
import { SUIT_META } from '@/components/tile/tileAssets';
import { StraightRules } from '@/components/guide/StraightRules';
import { NUMBER_RANK, TOP_NUMBER } from '@lexio/game-logic';

const SASIN = SUIT_META;

type Step = {
  n: number;
  eyebrow: string;
  title: string;
  body: string;
  visual: 'logo' | 'suits' | 'numbers' | 'counts' | 'straight' | 'first' | 'score';
};

const STEPS: Step[] = [
  {
    n: 1,
    eyebrow: 'STEP 01',
    title: 'FGG에 오신 것을 환영합니다',
    body: '사신수 타일과 포커 족보가 만난 클라이밍 보드게임. 가장 먼저 손에 든 모든 패를 비우면 승리합니다. 3~5인용.',
    visual: 'logo',
  },
  {
    n: 2,
    eyebrow: 'STEP 02',
    title: '4가지 사신수 · 60개의 타일',
    body: '주작·청룡·현무·백호 네 사신수가 각자의 문양을 갖습니다. 같은 숫자라면 주작이 가장 강하고 백호가 가장 약합니다.',
    visual: 'suits',
  },
  {
    n: 3,
    eyebrow: 'STEP 03',
    title: '숫자 서열은 거꾸로',
    body: '2가 가장 강하고 1이 그다음, 그 뒤로 15 → 14 → … → 3 순서입니다. 3이 가장 약합니다.',
    visual: 'numbers',
  },
  {
    n: 4,
    eyebrow: 'STEP 04',
    title: '같은 개수, 더 높게',
    body: '앞사람이 낸 개수만큼 받아쳐야 합니다. 1·2·3·5개만 가능 — 4개는 절대 낼 수 없습니다. 5개 조합은 포커 족보를 따릅니다.',
    visual: 'counts',
  },
  {
    n: 5,
    eyebrow: 'STEP 05',
    title: '스트레이트와 1·2',
    body: '1은 최고 숫자 뒤에 붙어 12-13-14-15-1을 만들 수 있고, 1-2-3-4-5와 2-3-4-5-6도 스트레이트입니다. 가장 강한 스트레이트는 1-2-3-4-5. 단, 1 뒤에 2를 이어 붙일 수는 없습니다.',
    visual: 'straight',
  },
  {
    n: 6,
    eyebrow: 'STEP 06',
    title: '선(先)은 백호 3',
    body: '매 라운드 가장 약한 타일인 백호 3을 가진 사람이 선이 됩니다. 첫 턴에 백호 3을 꼭 낼 필요는 없습니다.',
    visual: 'first',
  },
  {
    n: 7,
    eyebrow: 'STEP 07',
    title: '점수와 2 페널티',
    body: '라운드 종료 시 남은 타일 개수 차이만큼 칩을 교환합니다. 손에 2가 남으면 남은 패가 ×2배로 계산되니 주의하세요. (2개면 ×4, 3개면 ×8)',
    visual: 'score',
  },
];

function VisualLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 26,
          background:
            'linear-gradient(135deg, var(--fgg-gold-bright), var(--fgg-gold-deep))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--fgg-font-display)',
          fontStyle: 'italic',
          fontWeight: 600,
          color: '#1A1408',
          fontSize: 92,
          boxShadow:
            '0 14px 44px rgba(212, 166, 86, 0.45), inset 0 2px 0 rgba(255,255,255,0.35)',
          lineHeight: 1,
        }}
      >
        F
      </div>
      <div
        className="fgg-display"
        style={{
          fontSize: 52,
          letterSpacing: '0.16em',
          background:
            'linear-gradient(180deg, var(--fgg-gold-bright) 0%, var(--fgg-gold) 60%, var(--fgg-gold-deep) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        FGG
      </div>
      <div className="fgg-eyebrow">Four Guardian Gods</div>
    </div>
  );
}

function VisualSuits() {
  const order: Suit[] = ['sun', 'moon', 'star', 'cloud'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        {order.map((s, i) => (
          <div
            key={s}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transform: `translateY(${i * 4}px)`,
            }}
          >
            <Tile
              tile={{ number: 7 as TileNumber, suit: s } as TileType}
              size="sm"
            />
            <div
              style={{
                fontFamily: 'var(--fgg-font-display)',
                fontSize: 18,
                color: s === 'cloud' ? 'var(--fgg-gold)' : SASIN[s].color,
                fontWeight: 600,
              }}
            >
              {SASIN[s].name}
            </div>
            <div
              style={{
                fontSize: 10,
                minHeight: 15,
                color: 'var(--fgg-text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {i === 0 ? '가장 강함' : i === 3 ? '가장 약함' : null}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--fgg-text-muted)',
          fontFamily: 'var(--fgg-font-display)',
        }}
      >
        <span style={{ color: SASIN.sun.color }}>주작</span> ›
        <span style={{ color: SASIN.moon.color }}>{SASIN.moon.name}</span> ›
        <span style={{ color: SASIN.star.color }}>{SASIN.star.name}</span> ›
        <span style={{ color: 'var(--fgg-gold)' }}>{SASIN.cloud.name}</span>
      </div>
    </div>
  );
}

function VisualNumbers() {
  const seq = (Object.keys(NUMBER_RANK).map(Number) as TileNumber[]).sort((a, b) => NUMBER_RANK[b] - NUMBER_RANK[a]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <Tile tile={{ id: 'sun-2', number: TOP_NUMBER, suit: 'sun' }} size="lg" />
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--fgg-gold)' }}>주작 2 · 최강</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <Tile tile={{ id: 'cloud-3', number: 3, suit: 'cloud' }} size="lg" />
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--fgg-text-dim)' }}>백호 3 · 최약</p>
        </div>
      </div>
      <div style={{ fontSize: 14, color: 'var(--fgg-gold)', textAlign: 'center', textWrap: 'balance', lineHeight: 1.6 }}>{seq.join(' › ')}</div>
    </div>
  );
}

function VisualCounts() {
  const groups: { label: string; tiles: ExampleTile[]; ok: boolean }[] = [
    { label: '1개', tiles: [{ number: 5, suit: 'sun' }], ok: true },
    {
      label: '2개',
      tiles: [
        { number: 8, suit: 'sun' },
        { number: 8, suit: 'moon' },
      ],
      ok: true,
    },
    {
      label: '3개',
      tiles: [
        { number: 11, suit: 'sun' },
        { number: 11, suit: 'moon' },
        { number: 11, suit: 'star' },
      ],
      ok: true,
    },
    {
      label: '4개',
      tiles: [
        { number: 9, suit: 'sun' },
        { number: 9, suit: 'moon' },
        { number: 9, suit: 'star' },
        { number: 9, suit: 'cloud' },
      ],
      ok: false,
    },
    {
      label: '5개',
      tiles: [
        { number: 4, suit: 'sun' },
        { number: 5, suit: 'sun' },
        { number: 6, suit: 'sun' },
        { number: 7, suit: 'sun' },
        { number: 8, suit: 'sun' },
      ],
      ok: true,
    },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {groups.map((g) => (
        <div
          key={g.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: g.ok ? 1 : 0.5,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--fgg-font-display)',
              fontSize: 18,
              color: g.ok ? 'var(--fgg-gold-bright)' : '#FF8088',
              minWidth: 56,
              fontWeight: 600,
            }}
          >
            {g.ok ? '✓' : '✗'} {g.label}
          </span>
          <div style={{ display: 'flex', gap: 3 }}>
            {g.tiles.map((t, j) => (
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
  );
}

type ExampleTile = { number: TileNumber; suit: Suit };

function VisualFirst() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          fontFamily: 'var(--fgg-font-display)',
          fontSize: 60,
          color: 'var(--fgg-gold-bright)',
          fontStyle: 'italic',
          textShadow: '0 0 24px rgba(242,200,120,0.4)',
        }}
      >
        先
      </div>
      <Tile
        tile={{ number: 3 as TileNumber, suit: 'cloud' } as TileType}
        size="lg"
      />
      <div
        style={{
          fontSize: 13,
          color: 'var(--fgg-text-dim)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        가장 약한 타일 <strong style={{ color: 'var(--fgg-gold)' }}>백호 3</strong>
        <br />
        보유자가 매 라운드 선
      </div>
    </div>
  );
}

function VisualScore() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Tile
          tile={{ number: TOP_NUMBER, suit: 'sun' } as TileType}
          size="lg"
        />
        <span
          style={{
            fontFamily: 'var(--fgg-font-display)',
            fontSize: 40,
            color: 'var(--fgg-gold-bright)',
            fontStyle: 'italic',
          }}
        >
          ×2
        </span>
      </div>
      <div
        style={{
          padding: '12px 20px',
          border: '1px dashed var(--fgg-gold-deep)',
          borderRadius: 10,
          background: 'rgba(212,166,86,0.06)',
          fontSize: 12,
          color: 'var(--fgg-text-dim)',
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: 280,
        }}
      >
        손에 남은 <strong style={{ color: 'var(--fgg-gold-bright)' }}>2</strong> 1개당
        <br />
        남은 패 개수가 ×2배로 계산
      </div>
    </div>
  );
}

function StepVisual({ visual }: { visual: Step['visual'] }) {
  switch (visual) {
    case 'logo':
      return <VisualLogo />;
    case 'suits':
      return <VisualSuits />;
    case 'numbers':
      return <VisualNumbers />;
    case 'counts':
      return <VisualCounts />;
    case 'straight':
      return <StraightRules />;
    case 'first':
      return <VisualFirst />;
    case 'score':
      return <VisualScore />;
  }
}

export function TutorialScreen() {
  const [current, setCurrent] = useState(0);
  const step = STEPS[current];
  const isLast = current === STEPS.length - 1;
  const isFirst = current === 0;

  return (
    <div
      style={{
        minHeight: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background:
          'radial-gradient(ellipse at top, rgba(212,166,86,0.06) 0%, transparent 55%), var(--fgg-bg-0)',
        color: 'var(--fgg-text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Progress */}
      <div
        style={{
          padding: 'clamp(12px, 3vw, 20px) clamp(14px, 4vw, 32px)',
          paddingLeft: 'max(clamp(14px, 4vw, 32px), env(safe-area-inset-left, 0px))',
          paddingRight: 'max(clamp(14px, 4vw, 32px), env(safe-area-inset-right, 0px))',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: '1px solid var(--fgg-line)',
          background: 'var(--fgg-bg-1)',
        }}
      >
        <Link
          href="/"
          className="fgg-btn"
          style={{
            padding: '8px 14px',
            minHeight: 44,
            fontSize: 11,
            textDecoration: 'none',
          }}
        >
          ← 로비로
        </Link>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background:
                  i <= current
                    ? 'var(--fgg-gold-bright)'
                    : 'rgba(255,255,255,0.08)',
                transition: 'background 200ms',
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: 11,
            color: 'var(--fgg-text-muted)',
            fontFamily: 'var(--fgg-font-num)',
            letterSpacing: '0.08em',
          }}
        >
          {current + 1} / {STEPS.length}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          alignItems: 'start',
          padding: 'clamp(20px, 5vw, 40px) clamp(18px, 5vw, 60px)',
          paddingLeft: 'max(clamp(18px, 5vw, 60px), env(safe-area-inset-left, 0px))',
          paddingRight: 'max(clamp(18px, 5vw, 60px), env(safe-area-inset-right, 0px))',
          paddingBottom: 'calc(clamp(20px, 5vw, 40px) + 80px + env(safe-area-inset-bottom, 0px))' /* fixed footer 공간 */,
          gap: 'clamp(20px, 4vw, 60px)',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div>
          <div className="fgg-eyebrow" style={{ marginBottom: 12 }}>
            {step.eyebrow}
          </div>
          <h1
            className="fgg-display"
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              margin: '0 0 20px',
              color: 'var(--fgg-text)',
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            {step.title}
          </h1>
          <p
            style={{
              fontSize: 16,
              color: 'var(--fgg-text-dim)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {step.body}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <StepVisual visual={step.visual} />
        </div>
      </div>

      {/* Footer nav — viewport bottom 고정 */}
      <div
        style={{
          padding: 'clamp(12px, 3vw, 20px) clamp(14px, 4vw, 32px)',
          paddingLeft: 'max(clamp(14px, 4vw, 32px), env(safe-area-inset-left, 0px))',
          paddingRight: 'max(clamp(14px, 4vw, 32px), env(safe-area-inset-right, 0px))',
          paddingBottom: 'calc(clamp(12px, 3vw, 20px) + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--fgg-line)',
          background: 'var(--fgg-bg-1)',
          gap: 12,
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <button
          className="fgg-btn"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={isFirst}
          style={{ padding: '10px 18px', minHeight: 44, fontSize: 13 }}
        >
          ← 이전
        </button>

        {isLast ? (
          <Link
            href="/"
            className="fgg-btn fgg-btn--primary"
            style={{
              padding: '12px 28px',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            로비로 돌아가기 ▸
          </Link>
        ) : (
          <button
            className="fgg-btn fgg-btn--primary"
            onClick={() => setCurrent((c) => Math.min(STEPS.length - 1, c + 1))}
            style={{ padding: '12px 28px', fontSize: 13 }}
          >
            다음 ▸
          </button>
        )}
      </div>
    </div>
  );
}
