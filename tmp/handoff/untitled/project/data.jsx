/* FGG mock data — sample hands, players, room state */

const SUIT_KEYS = ['cloud', 'star', 'moon', 'sun']; // low → high

function makeTile(n, s) { return { n, s, id: `${n}-${s}` }; }

// Default hand: a curated mix that has a recognizable straight + pair + high tile.
// Sorted from low to high for display.
function sampleHandFor4P() {
  // 4-player game uses 1..13 (52 tiles, 13 each)
  // Hand: cloud-3, star-4, moon-5, sun-6, cloud-7 (straight 3-7),
  //       moon-9, moon-9 (pair-ish wait, need different suits but same n)
  //       sun-11, cloud-13, star-13 (pair), sun-1, sun-2, moon-2
  return [
    makeTile(3, 'cloud'),
    makeTile(4, 'star'),
    makeTile(5, 'moon'),
    makeTile(6, 'sun'),
    makeTile(7, 'cloud'),
    makeTile(9, 'star'),
    makeTile(9, 'moon'),
    makeTile(11, 'sun'),
    makeTile(13, 'cloud'),
    makeTile(13, 'star'),
    makeTile(1, 'sun'),
    makeTile(2, 'moon'),
    makeTile(2, 'sun'),
  ];
}

function sampleHandFor3P() {
  // 3p uses 1..9
  return [
    makeTile(3, 'cloud'),
    makeTile(4, 'sun'),
    makeTile(5, 'moon'),
    makeTile(6, 'cloud'),
    makeTile(7, 'star'),
    makeTile(7, 'moon'),
    makeTile(8, 'cloud'),
    makeTile(9, 'star'),
    makeTile(9, 'moon'),
    makeTile(1, 'sun'),
    makeTile(2, 'moon'),
    makeTile(2, 'sun'),
  ];
}

function sampleHandFor5P() {
  // 5p uses 1..15, 12 tiles per player
  return [
    makeTile(3, 'cloud'),
    makeTile(5, 'star'),
    makeTile(7, 'sun'),
    makeTile(8, 'moon'),
    makeTile(10, 'cloud'),
    makeTile(11, 'star'),
    makeTile(12, 'moon'),
    makeTile(13, 'sun'),
    makeTile(14, 'star'),
    makeTile(15, 'moon'),
    makeTile(1, 'sun'),
    makeTile(2, 'sun'),
  ];
}

const HAND_BY_COUNT = {
  3: sampleHandFor3P,
  4: sampleHandFor4P,
  5: sampleHandFor5P,
};

// Players (other seats hold face-down counts)
const PLAYERS_5 = [
  { id: 'me',  name: '나',       avatar: '나', chips: 28, tilesLeft: 12, isMe: true,  rank: '서울' },
  { id: 'p2',  name: '용현',     avatar: '용', chips: 14, tilesLeft: 9,  isTurn: true, rank: '대전' },
  { id: 'p3',  name: 'NeoTaco',  avatar: 'N', chips: 22, tilesLeft: 11, rank: '부산' },
  { id: 'p4',  name: 'Mira',     avatar: 'M', chips: 31, tilesLeft: 8,  rank: '광주' },
  { id: 'p5',  name: '소영',     avatar: '소', chips: 19, tilesLeft: 12, rank: '인천' },
];
const PLAYERS_4 = PLAYERS_5.slice(0, 4);
const PLAYERS_3 = PLAYERS_5.slice(0, 3);

const PLAYERS_BY_COUNT = { 3: PLAYERS_3, 4: PLAYERS_4, 5: PLAYERS_5 };

// Field — last play in the center (a pair of moon-9 + star-9 for example)
const SAMPLE_FIELD = [
  makeTile(9, 'cloud'),
  makeTile(9, 'sun'),
];
// Combination label for the field
const SAMPLE_FIELD_LABEL = '페어 · 9';

// Hand history
const SAMPLE_HISTORY = [
  { who: '소영',   combo: '구름 3', n: 1 },
  { who: '용현',   combo: '5 페어', n: 2 },
  { who: '나',     combo: '7 페어', n: 2 },
  { who: 'NeoTaco', combo: '패스', n: 0, pass: true },
  { who: 'Mira',   combo: '9 페어', n: 2 },
];

// Hand rankings (combinations)
const HAND_RANKS = [
  { name: '싱글',         desc: '타일 1개', count: 1, sub: '최강패: 해 2' },
  { name: '페어',         desc: '같은 숫자 2개', count: 2, sub: '최강패: 해 2 + 임의 2' },
  { name: '트리플',       desc: '같은 숫자 3개', count: 3, sub: '최강패: 2 트리플' },
  { name: '스트레이트',   desc: '연속 5개 (문양 자유)', count: 5, level: 1, sub: '5조합 중 가장 약함' },
  { name: '플러시',       desc: '같은 문양 5개', count: 5, level: 2 },
  { name: '풀하우스',     desc: '페어 + 트리플', count: 5, level: 3 },
  { name: '포카드',       desc: '같은 숫자 4개 + 1', count: 5, level: 4 },
  { name: '스트레이트 플러시', desc: '문양·연속 5개', count: 5, level: 5, sub: '최강 조합' },
];

Object.assign(window, {
  HAND_BY_COUNT,
  PLAYERS_BY_COUNT,
  SAMPLE_FIELD,
  SAMPLE_FIELD_LABEL,
  SAMPLE_HISTORY,
  HAND_RANKS,
  makeTile,
});
