import 'models/tile.dart';

/// 최강 숫자이며 라운드 종료 페널티 대상입니다.
const topNumber = 2;

// 숫자 서열: 2가 최강(14), 3이 최약(0)
const numberRank = {
  3: 0,
  4: 1,
  5: 2,
  6: 3,
  7: 4,
  8: 5,
  9: 6,
  10: 7,
  11: 8,
  12: 9,
  13: 10,
  14: 11,
  15: 12,
  1: 13,
  2: 14,
};

// 문양 서열: 해가 최강(3), 구름이 최약(0)
const suitRank = {Suit.cloud: 0, Suit.star: 1, Suit.moon: 2, Suit.sun: 3};

const suitLabel = {
  Suit.sun: '주작',
  Suit.moon: '청룡',
  Suit.star: '현무',
  Suit.cloud: '백호',
};

// 인원수별 게임 설정
const maxNumberByPlayerCount = {3: 9, 4: 13, 5: 15};
const tilesPerPlayerByCount = {3: 12, 4: 13, 5: 12};
