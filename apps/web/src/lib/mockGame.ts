import { detectCombination, getGameConfig } from '@lexio/game-logic';
import type { ClientGameState, Tile, ClientPlayer, TileCombination } from '@lexio/game-logic';

const t = (number: number, suit: 'sun' | 'moon' | 'star' | 'cloud'): Tile => ({
  id: `${suit}-${number}`,
  number: number as Tile['number'],
  suit,
});

// FGG 사신수 매핑 (내부 suit 키는 게임로직 호환용)

const HAND_3P: Tile[] = [
  t(3, 'cloud'), t(2, 'sun'), t(4, 'moon'), t(5, 'star'), t(6, 'cloud'),
  t(7, 'sun'),   t(7, 'moon'), t(8, 'cloud'),t(9, 'star'), t(9, 'moon'),
  t(1, 'sun'),   t(1, 'cloud'),
];

const HAND_4P: Tile[] = [
  t(3, 'cloud'), t(2, 'star'), t(4, 'moon'), t(5, 'sun'), t(6, 'cloud'),
  t(7, 'sun'),   t(9, 'star'), t(9, 'moon'), t(11, 'sun'),t(13, 'cloud'),
  t(13, 'star'), t(1, 'sun'),  t(1, 'moon'),
];

const HAND_5P: Tile[] = [
  t(3, 'cloud'), t(2, 'sun'),  t(5, 'star'), t(7, 'moon'),t(8, 'cloud'),
  t(10, 'star'), t(11, 'moon'),t(12, 'sun'), t(13, 'star'),t(14, 'moon'),
  t(15, 'cloud'),t(1, 'sun'),
];

const HAND_BY_COUNT: Record<3 | 4 | 5, Tile[]> = {
  3: HAND_3P,
  4: HAND_4P,
  5: HAND_5P,
};

const NAMES = ['나', '용현', 'NeoTaco', 'Mira', '소영'];

const SAMPLE_LAST_PLAY = detectCombination([t(9, 'cloud'), t(9, 'sun')]) as TileCombination;

export interface MockSetup {
  myId: string;
  roomId: string;
  state: ClientGameState;
}

export function buildMockGame(
  playerCount: 3 | 4 | 5,
  options: { myTurn?: boolean; noLastPlay?: boolean } = {},
): MockSetup {
  const myHand = HAND_BY_COUNT[playerCount];
  const tilesPerPlayer = playerCount === 4 ? 13 : 12;

  const players: ClientPlayer[] = Array.from({ length: playerCount }, (_, i) => ({
    id: `p${i}`,
    name: NAMES[i],
    handCount: i === 0 ? myHand.length : tilesPerPlayer - Math.floor(Math.random() * 4),
    chips: [28, 14, 22, 31, 19][i],
    isConnected: true,
    hand: i === 0 ? myHand : undefined,
  }));

  const state: ClientGameState = {
    config: getGameConfig(playerCount),
    hasPlayedThisRound: !options.noLastPlay,
    phase: 'playing',
    players,
    currentPlayerIndex: options.noLastPlay || options.myTurn ? 0 : 1,
    lastPlay: options.noLastPlay ? null : SAMPLE_LAST_PLAY,
    lastPlayerId: options.noLastPlay ? null : `p${playerCount - 1}`,
    passCount: options.noLastPlay || options.myTurn ? 0 : 1,
    roundNumber: 3,
    firstPlayerId: 'p0',
  };

  return { myId: 'p0', roomId: 'FGG-2847', state };
}
