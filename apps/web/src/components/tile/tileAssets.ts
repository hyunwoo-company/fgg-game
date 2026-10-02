// FGG 타일 — 에셋 경로 · 3D 몸체 기하 · 크기 · 최강 숫자.
// public/tiles/ 에셋은 미리 렌더한 결과물이다 (repo 밖 파이프라인):
//   body/        3dsvg 로 렌더한 3D 몸체 (normal · top · back)
//   bg/ bg-top/  AI 생성 민화풍 배경 (일반 / 최강 숫자)
//   creature/ creature-top/  배경 제거한 사신수 일러스트 (일반 / 최강 숫자)

import type { Suit, Tile as TileType, TileNumber } from '@lexio/game-logic';

/**
 * 최강 숫자 — 이 숫자 타일만 금빛 몸체 + 특별 액자(TopFrame)로 그린다.
 * 렉시오 룰 변경 작업(별도 세션)에서 game-logic 상수로 대체 예정.
 */
export const TOP_NUMBER: TileNumber = 2;

export function isTopTile(tile: TileType): boolean {
  return tile.number === TOP_NUMBER;
}

/* ------------------------------------------------------------------ 크기 */

export type TileSize = 'sm' | 'md' | 'lg';

export interface TileSizeSpec {
  /** 앞면 폭 = 레이아웃 박스 폭 */
  readonly w: number;
  /** 레이아웃 박스 높이 (기존 API 와 동일 — 3D 두께는 박스 아래로 시각적으로만 나옴) */
  readonly h: number;
  readonly num: number;
  readonly padX: number;
  readonly padY: number;
  readonly radius: number;
}

export const TILE_SIZE: Readonly<Record<TileSize, TileSizeSpec>> = {
  sm: { w: 40, h: 56, num: 12, padX: 4, padY: 12, radius: 5 },
  md: { w: 56, h: 80, num: 17, padX: 5, padY: 16, radius: 7 },
  lg: { w: 72, h: 102, num: 22, padX: 6, padY: 20, radius: 9 },
};

/* ---------------------------------------------------------------- 사신수 */

export type SuitKey = 'jujak' | 'hyunmu' | 'baekho' | 'cheongryong';

export interface SuitMeta {
  readonly name: string;
  /** 숫자 색 */
  readonly color: string;
  /** 에셋 파일명 */
  readonly key: SuitKey;
}

// FGG 사신수 — 주작(火/南) / 현무(水/北) / 백호(金/西) / 청룡(木/東)
// 내부 suit 키는 게임로직 호환용 (UI에는 노출 안 함)
export const SUIT_META: Readonly<Record<Suit, SuitMeta>> = {
  sun: { name: '주작', color: '#C8323D', key: 'jujak' },
  moon: { name: '현무', color: '#2A8C56', key: 'hyunmu' },
  star: { name: '백호', color: '#1A1408', key: 'baekho' },
  cloud: { name: '청룡', color: '#3A5A8C', key: 'cheongryong' },
};

/* ------------------------------------------------------------ 3D 몸체 기하 */

/** 3D 몸체 렌더 PNG 원본 픽셀 크기 (body/normal · top · back 공통) */
export const BODY_PX: Readonly<{ w: number; h: number }> = { w: 288, h: 381 };

/** 몸체 이미지 안에서 앞면(cap) 위치 — 0~1 비율 (3dsvg 지오메트리 투영 bbox) */
export const FACE_RECT: Readonly<{ x: number; y: number; w: number; h: number }> = {
  x: 0.0709,
  y: 0.0389,
  w: 0.8597,
  h: 0.8737,
};

export interface TileGeometry {
  /** 몸체 이미지 표시 크기 (앞면 폭 = TILE_SIZE.w 가 되도록) */
  readonly imgW: number;
  readonly imgH: number;
  /** 레이아웃 박스(앞면 좌상단 기준) 대비 몸체 이미지 위치 */
  readonly imgLeft: number;
  readonly imgTop: number;
  /** 앞면 실제 표시 크기 */
  readonly faceW: number;
  readonly faceH: number;
}

function computeGeometry(size: TileSize): TileGeometry {
  const d = TILE_SIZE[size];
  const imgW = d.w / FACE_RECT.w;
  const imgH = (imgW * BODY_PX.h) / BODY_PX.w;
  return {
    imgW,
    imgH,
    imgLeft: -FACE_RECT.x * imgW,
    imgTop: -FACE_RECT.y * imgH,
    faceW: d.w,
    faceH: FACE_RECT.h * imgH,
  };
}

export const TILE_GEOMETRY: Readonly<Record<TileSize, TileGeometry>> = {
  sm: computeGeometry('sm'),
  md: computeGeometry('md'),
  lg: computeGeometry('lg'),
};

/* ------------------------------------------------------------- 에셋 경로 */

export type BodyKind = 'normal' | 'top' | 'back';

export function bodySrc(kind: BodyKind): string {
  return `/tiles/body/${kind}.webp`;
}

/** 앞면 액자 패널 배경 (일반 = AI 민화 배경 / 최강 = 특별 배경) */
export function backgroundSrc(suit: Suit, top: boolean): string {
  return `/tiles/${top ? 'bg-top' : 'bg'}/${SUIT_META[suit].key}.webp`;
}

/** 사신수 일러스트 (일반 = 배경 제거 cutout / 최강 = 특별 생물) */
export function creatureSrc(suit: Suit, top: boolean): string {
  return `/tiles/${top ? 'creature-top' : 'creature'}/${SUIT_META[suit].key}.webp`;
}
