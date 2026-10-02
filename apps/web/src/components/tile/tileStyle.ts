// FGG 타일 — 스타일 수치 (타일 디자인 비교에서 확정한 일반 C2 / 최강 숫자 S1 값).

import type { CSSProperties } from 'react';
import type { TileSizeSpec } from './tileAssets';

export const NUM_FONT = 'Cormorant Garamond, "Noto Serif KR", Georgia, serif';
export const NUM_TEXT_SHADOW = '0 1px 0 rgba(255, 250, 230, 0.7)';

/** 최강 숫자 금 숫자판 위 숫자 색 — 금 그라데이션 위에서 상아색보다 대비가 훨씬 높음 */
export const TOP_NUMBER_COLOR = '#2A1A08';

/* ------------------------------------------------------------ 바닥 그림자 */

/** 3D 몸체 PNG 의 바닥 그림자 (기존 .fgg-tile box-shadow ground shadow 근사) */
export const GROUND_SHADOW =
  'drop-shadow(0 4px 4px rgba(0,0,0,0.3)) drop-shadow(0 10px 10px rgba(0,0,0,0.4)) drop-shadow(0 18px 16px rgba(0,0,0,0.3))';

/** 선택되어 들렸을 때 — 그림자를 조금 더 아래·넓게 */
export const GROUND_SHADOW_LIFTED =
  'drop-shadow(0 8px 6px rgba(0,0,0,0.32)) drop-shadow(0 16px 14px rgba(0,0,0,0.42)) drop-shadow(0 26px 22px rgba(0,0,0,0.32))';

/* ------------------------------------------------------- 일반 액자 (C2) */

export interface FrameSpec {
  /** 상아 여백 = 앞면 폭 × 0.07 (최소 2px) */
  readonly margin: number;
  /** 패널 라운드 = 몸체 radius × 0.6 */
  readonly radius: number;
  /** 금선 안쪽 어두운 선 굵기 (sm 은 뭉개짐 방지로 얇게) */
  readonly darkLine: number;
}

export const FRAME_GOLD = '#C9A45C';
export const PANEL_FALLBACK_BG = 'rgba(60, 46, 28, 0.35)';

export function frameSpec(d: TileSizeSpec): FrameSpec {
  return {
    margin: Math.max(2, Math.round(d.w * 0.07)),
    radius: Math.round(d.radius * 0.6 * 10) / 10,
    darkLine: d.w <= 40 ? 0.5 : 1,
  };
}

/* --------------------------------------------- 최강 숫자 특별 액자 (S1) */

export interface TopFrameSpec extends FrameSpec {
  /** 바깥 금선 / 먹색 간격 / 안쪽 가는 금선 (gap·innerGold 0 = 2중선 없음) */
  readonly outerGold: number;
  readonly gap: number;
  readonly innerGold: number;
  /** 모서리 장식 (null = 생략) */
  readonly ornament: { readonly size: number; readonly stroke: number; readonly inset: number } | null;
  /** 몸체 바깥 금빛 glow */
  readonly glow: string;
}

export const TOP_GOLD_OUTER = '#E2C072';
export const TOP_GOLD_INNER = '#F3D98E';
export const TOP_GAP_COLOR = 'rgba(40, 24, 6, 0.55)';

/** sm 은 2중선·장식이 1~2px 로 뭉개져 밝은 금선 1줄 + 얇은 안선으로 단순화 */
export function topFrameSpec(d: TileSizeSpec): TopFrameSpec {
  const base = frameSpec(d);
  if (d.w <= 40) {
    return {
      ...base,
      outerGold: 1,
      gap: 0,
      innerGold: 0,
      ornament: null,
      glow: 'drop-shadow(0 0 3px rgba(242, 200, 120, 0.4))',
    };
  }
  const large = d.w >= 72;
  const innerGold = large ? 1 : 0.75;
  return {
    ...base,
    outerGold: 1,
    gap: 1,
    innerGold,
    ornament: { size: Math.round(d.w * 0.12), stroke: large ? 1.2 : 1, inset: 1 + 1 + innerGold + 0.5 },
    glow: large
      ? 'drop-shadow(0 0 6px rgba(242, 200, 120, 0.55))'
      : 'drop-shadow(0 0 5px rgba(242, 200, 120, 0.5))',
  };
}

/* ---------------------------------------------------------------- 숫자판 */

export type PlateKind = 'ivory' | 'gold';

export const PLATE_LOOK: Readonly<Record<PlateKind, CSSProperties>> = {
  ivory: {
    background: 'rgba(252, 247, 232, 0.86)',
    borderColor: 'rgba(201, 164, 92, 0.75)',
    boxShadow: '0 1px 1px rgba(0,0,0,0.18)',
  },
  gold: {
    background: 'linear-gradient(180deg, #F6E3A1 0%, #D9B45A 100%)',
    borderColor: '#A57C2C',
    boxShadow: '0 1px 1px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,250,225,0.6)',
  },
};

export interface PlateMetrics {
  readonly padX: number;
  readonly padY: number;
  readonly border: number;
  readonly radius: number;
}

export function plateMetrics(d: TileSizeSpec): PlateMetrics {
  return {
    padX: Math.max(1, Math.round(d.num * 0.12)),
    padY: Math.max(0, Math.round(d.num * 0.04)),
    border: 1,
    radius: Math.max(2, Math.round(d.num * 0.2)),
  };
}

/* ------------------------------------------------------------- 선택 상태 */

/** 앞면 위 금색 2px 링 + 은은한 glow */
export const SELECT_RING_SHADOW =
  '0 0 0 2px var(--fgg-gold), 0 0 12px 2px rgba(242, 200, 120, 0.55), inset 0 0 10px rgba(255, 236, 170, 0.35)';
