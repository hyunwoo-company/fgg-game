'use client';

// FGG 타일 — 3D 몸체 PNG + 앞면 액자(민화 배경) + 사신수 일러스트 + 숫자판.
// - 일반 타일: body/normal + 상아 여백·금선 패널(bg) + creature + 상아 숫자판
// - 최강 숫자(TOP_NUMBER): body/top + 특별 액자(2중 금선·모서리 장식) + bg-top + creature-top + 금 숫자판 + 금빛 glow
// 레이아웃 박스는 기존과 같은 SIZE.w × SIZE.h — 3D 두께(약 3~5px)·바닥 그림자는 박스 아래로 시각적으로만 나온다.

import type { CSSProperties } from 'react';
import type { Tile as TileType } from '@lexio/game-logic';
import {
  SUIT_META,
  TILE_GEOMETRY,
  TILE_SIZE,
  backgroundSrc,
  creatureSrc,
  isTopTile,
  type TileSize,
} from './tileAssets';
import {
  BackPattern,
  BodyImage,
  CornerNumbers,
  Creature,
  FaceBox,
  FramedPanel,
  SelectionRing,
  TopFramedPanel,
} from './TileParts';
import { GROUND_SHADOW, GROUND_SHADOW_LIFTED, topFrameSpec } from './tileStyle';

/** 선택 lift 는 CSS 변수로 넘긴다 — 인라인 transform 은 :hover transform 을 덮어버리므로 */
interface TileButtonStyle extends CSSProperties {
  '--fgg-tile-lift'?: string;
}

interface TileProps {
  tile: TileType;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: TileSize;
}

export function Tile({ tile, isSelected, onClick, disabled, size = 'md' }: TileProps) {
  const s = SUIT_META[tile.suit];
  const d = TILE_SIZE[size];
  const g = TILE_GEOMETRY[size];
  const top = isTopTile(tile);
  const liftY = isSelected ? -Math.round(d.h * 0.18) : 0;
  const isClickable = !!onClick && !disabled;

  const shadow = isSelected ? GROUND_SHADOW_LIFTED : GROUND_SHADOW;
  const filter = top ? `${topFrameSpec(d).glow} ${shadow}` : shadow;

  const style: TileButtonStyle = {
    width: d.w,
    height: d.h,
    cursor: disabled ? 'default' : 'pointer',
    '--fgg-tile-lift': `${liftY}px`,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${s.name} ${tile.number}`}
      className={`fgg-tile${isSelected ? ' is-selected' : ''}${isClickable ? ' is-clickable' : ''}${top ? ' is-top' : ''}`}
      style={style}
    >
      <BodyImage kind={top ? 'top' : 'normal'} g={g} filter={filter} />
      <FaceBox g={g} radius={d.radius}>
        {top ? (
          <TopFramedPanel src={backgroundSrc(tile.suit, true)} d={d} />
        ) : (
          <FramedPanel src={backgroundSrc(tile.suit, false)} d={d} />
        )}
        <Creature src={creatureSrc(tile.suit, top)} alt={s.name} d={d} top={top} />
        <CornerNumbers tile={tile} d={d} top={top} />
        {isSelected ? <SelectionRing /> : null}
      </FaceBox>
    </button>
  );
}

export function TileBack({ size = 'md' }: { size?: TileSize }) {
  const d = TILE_SIZE[size];
  const g = TILE_GEOMETRY[size];
  return (
    <div className="fgg-tile fgg-tile--back" style={{ width: d.w, height: d.h }}>
      <BodyImage kind="back" g={g} filter={GROUND_SHADOW} />
      <FaceBox g={g} radius={d.radius}>
        <BackPattern d={d} />
      </FaceBox>
    </div>
  );
}
