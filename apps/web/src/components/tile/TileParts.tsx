// FGG 타일 — 구성 요소 (3D 몸체 PNG 위에 앞면(faceRect) overlay).
// 레이어 순서: 몸체 이미지 → 앞면 박스[액자 패널(배경) → 일러스트(z1) → 숫자판(z3) → 선택 링(z6)]
// 앞면 박스·액자 레이어에는 z-index 를 주지 않아 stacking context 를 만들지 않는다.

import type { CSSProperties, ReactNode } from 'react';
import type { Tile as TileType } from '@lexio/game-logic';
import { SUIT_META, bodySrc, type BodyKind, type TileGeometry, type TileSizeSpec } from './tileAssets';
import {
  FRAME_GOLD,
  NUM_FONT,
  NUM_TEXT_SHADOW,
  PANEL_FALLBACK_BG,
  PLATE_LOOK,
  SELECT_RING_SHADOW,
  TOP_GAP_COLOR,
  TOP_GOLD_INNER,
  TOP_GOLD_OUTER,
  TOP_NUMBER_COLOR,
  frameSpec,
  plateMetrics,
  topFrameSpec,
} from './tileStyle';

const IMG_BASE: CSSProperties = { display: 'block', userSelect: 'none', pointerEvents: 'none' };

/** 3D 몸체 PNG — 앞면 폭이 레이아웃 박스 폭과 같도록 확대·이동 (두께·투명 여백은 박스 밖으로) */
export function BodyImage({ kind, g, filter }: { kind: BodyKind; g: TileGeometry; filter: string }) {
  return (
    <img
      src={bodySrc(kind)}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{
        ...IMG_BASE,
        position: 'absolute',
        left: g.imgLeft,
        top: g.imgTop,
        width: g.imgW,
        height: g.imgH,
        maxWidth: 'none',
        filter,
        transition: 'filter 160ms',
      }}
    />
  );
}

/** 앞면(faceRect) 영역 — 레이아웃 박스 좌상단에 맞춤 */
export function FaceBox({ g, radius, children }: { g: TileGeometry; radius: number; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: g.faceW,
        height: g.faceH,
        borderRadius: radius,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}

/** 앞면 라운드 클립 (FaceBox 의 borderRadius 상속) */
function FaceClip({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
}

function CoverImage({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{
        ...IMG_BASE,
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
}

/** 일반 액자: 상아 여백 + 금선 + 어두운 안선 + inset 그림자(상감) 패널에 배경 cover */
export function FramedPanel({ src, d }: { src: string; d: TileSizeSpec }) {
  const f = frameSpec(d);
  return (
    <FaceClip>
      <div
        style={{
          position: 'absolute',
          inset: f.margin,
          borderRadius: f.radius,
          overflow: 'hidden',
          background: PANEL_FALLBACK_BG,
        }}
      >
        <CoverImage src={src} />
        {/* 테두리/그림자는 이미지 위 overlay 에 (inset box-shadow 는 자식 이미지에 가려지므로) */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: `1px solid ${FRAME_GOLD}`,
            boxShadow: `inset 0 0 0 ${f.darkLine}px rgba(40, 25, 10, 0.45), inset 0 1px 2px rgba(0, 0, 0, 0.35)`,
          }}
        />
      </div>
    </FaceClip>
  );
}

type OrnamentCorner = 'tl' | 'tr' | 'bl' | 'br';

/** 좌상단/우하단은 숫자판이 덮는 자리라 우상단/좌하단에만 장식 */
const ORNAMENT_CORNERS: readonly OrnamentCorner[] = ['tr', 'bl'];

const ORNAMENT_TRANSFORM: Readonly<Record<OrnamentCorner, string | undefined>> = {
  tl: undefined,
  tr: 'scaleX(-1)',
  bl: 'scaleY(-1)',
  br: 'scale(-1, -1)',
};

/** ㄱ자 꺾쇠 + 안쪽 작은 점 (좌상단 기준 도안을 뒤집어 사용) */
function CornerOrnament({
  corner,
  size,
  stroke,
  inset,
}: {
  corner: OrnamentCorner;
  size: number;
  stroke: number;
  inset: number;
}) {
  const top = corner === 'tl' || corner === 'tr';
  const left = corner === 'tl' || corner === 'bl';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      style={{
        position: 'absolute',
        top: top ? inset : undefined,
        bottom: top ? undefined : inset,
        left: left ? inset : undefined,
        right: left ? undefined : inset,
        transform: ORNAMENT_TRANSFORM[corner],
        overflow: 'visible',
      }}
    >
      <path
        d="M9.2 1 H2.6 Q1 1 1 2.6 V9.2"
        fill="none"
        stroke={TOP_GOLD_INNER}
        strokeWidth={(stroke * 10) / size}
        strokeLinecap="round"
      />
      <circle cx={3.9} cy={3.9} r={1} fill={TOP_GOLD_INNER} />
    </svg>
  );
}

/** 최강 숫자 특별 액자: 금선 2중(바깥 금선 + 먹색 간격 + 안쪽 가는 금선) + 모서리 장식 + inset 그림자 */
export function TopFramedPanel({ src, d }: { src: string; d: TileSizeSpec }) {
  const f = topFrameSpec(d);
  const ornament = f.ornament;
  const rings =
    f.gap > 0 && f.innerGold > 0
      ? `inset 0 0 0 ${f.gap}px ${TOP_GAP_COLOR}, inset 0 0 0 ${f.gap + f.innerGold}px ${TOP_GOLD_INNER}`
      : 'inset 0 0 0 0.5px rgba(40, 25, 10, 0.45)';
  return (
    <FaceClip>
      <div
        style={{
          position: 'absolute',
          inset: f.margin,
          borderRadius: f.radius,
          overflow: 'hidden',
          background: PANEL_FALLBACK_BG,
        }}
      >
        <CoverImage src={src} />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: `${f.outerGold}px solid ${TOP_GOLD_OUTER}`,
            boxShadow: `${rings}, inset 0 1px 3px rgba(0, 0, 0, 0.4)`,
          }}
        />
        {ornament
          ? ORNAMENT_CORNERS.map((corner) => (
              <CornerOrnament
                key={corner}
                corner={corner}
                size={ornament.size}
                stroke={ornament.stroke}
                inset={ornament.inset}
              />
            ))
          : null}
      </div>
    </FaceClip>
  );
}

/** 가운데 사신수 일러스트 — padY/padX 영역에 contain (배경 제거판이라 normal 블렌드) */
export function Creature({ src, alt, d, top }: { src: string; alt: string; d: TileSizeSpec; top: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: d.padY,
        bottom: d.padY,
        left: d.padX,
        right: d.padX,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          ...IMG_BASE,
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          filter: top ? 'saturate(1.15) contrast(1.05)' : 'saturate(0.97)',
        }}
      />
    </div>
  );
}

/**
 * 좌상단 + 우하단(180°) 숫자판. 액자 패널(금선) 바로 안쪽에 둔다.
 * 일반 = 반투명 상아 판 + suit 색 숫자 / 최강 = 금 그라데이션 판 + 먹색 숫자.
 */
export function CornerNumbers({ tile, d, top }: { tile: TileType; d: TileSizeSpec; top: boolean }) {
  const p = plateMetrics(d);
  const inset = frameSpec(d).margin;
  // 판의 padding+border 만큼 바깥으로 빼서 숫자 글리프가 패널 안쪽 (top 2 / left 4)+inset 근처에 오도록
  const y = 2 + inset - (p.padY + p.border);
  const x = 4 + inset - (p.padX + p.border);
  const base: CSSProperties = {
    position: 'absolute',
    fontFamily: NUM_FONT,
    fontWeight: 800,
    fontSize: d.num,
    lineHeight: 1,
    color: top ? TOP_NUMBER_COLOR : SUIT_META[tile.suit].color,
    textShadow: NUM_TEXT_SHADOW,
    letterSpacing: '-0.03em',
    zIndex: 3,
    pointerEvents: 'none',
    userSelect: 'none',
    padding: `${p.padY}px ${p.padX}px`,
    borderWidth: p.border,
    borderStyle: 'solid',
    borderRadius: p.radius,
    ...PLATE_LOOK[top ? 'gold' : 'ivory'],
  };
  return (
    <>
      <span style={{ ...base, top: y, left: x }}>{tile.number}</span>
      <span style={{ ...base, bottom: y, right: x, transform: 'rotate(180deg)', transformOrigin: 'center' }}>
        {tile.number}
      </span>
    </>
  );
}

/** 뒷면: 사선 패턴 박스 + "F" (몸체는 3D back PNG) */
export function BackPattern({ d }: { d: TileSizeSpec }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: '16%',
          border: '1px solid rgba(140, 110, 60, 0.3)',
          borderRadius: 3,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(140,110,60,0.07) 0 1px, transparent 1px 6px)',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: d.w * 0.32,
            fontWeight: 600,
            color: 'rgba(140, 110, 60, 0.55)',
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          F
        </span>
      </div>
    </>
  );
}

/** 선택 상태: 앞면 위 금색 2px 링 + 은은한 glow */
export function SelectionRing() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        boxShadow: SELECT_RING_SHADOW,
        pointerEvents: 'none',
        zIndex: 6,
      }}
    />
  );
}
