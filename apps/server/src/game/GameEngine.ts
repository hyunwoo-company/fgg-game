import {
  createDeck, shuffleDeck, dealTiles, findFirstPlayer,
  detectCombination, canPlay, calculateScoring, applyExchanges,
  getGameConfig,
} from '@fgg/game-logic';
import type {
  GameState, Player, Tile, TileCombination, PlayerCount, GameMode,
  ClientGameState, ClientPlayer, RoundResult,
} from '@fgg/game-logic';

export class GameEngine {
  private state: GameState;
  private playerCount: PlayerCount;
  private mode: GameMode;
  private hasPlayedThisRound = false;

  constructor(
    players: Pick<Player, 'id' | 'name'>[],
    playerCount: PlayerCount,
    mode: GameMode = 'recommended',
  ) {
    this.playerCount = playerCount;
    this.mode = mode;
    this.state = {
      phase: 'waiting',
      players: players.map((p) => ({ ...p, hand: [], chips: 60, isConnected: true })),
      currentPlayerIndex: 0,
      lastPlay: null,
      lastPlayerId: null,
      passCount: 0,
      roundNumber: 0,
      firstPlayerId: null,
    };
  }

  /** 다음 라운드 시작 시 현재 인원수에 맞춰 GameConfig 재선택 (인원이 빠졌으면 자동으로 적용됨) */
  startRound(): void {
    // 현재 살아있는 (게임에 남아있는) 플레이어 수에 맞춰 config 재계산
    this.playerCount = this.state.players.length as PlayerCount;
    const config = getGameConfig(this.playerCount, this.mode);
    this.hasPlayedThisRound = false;
    const deck = shuffleDeck(createDeck(config));
    const hands = dealTiles(deck, config);
    const firstIdx = findFirstPlayer(hands);

    this.state = {
      ...this.state,
      phase: 'playing',
      players: this.state.players.map((p, i) => ({ ...p, hand: hands[i] })),
      currentPlayerIndex: firstIdx,
      lastPlay: null,
      lastPlayerId: null,
      passCount: 0,
      roundNumber: this.state.roundNumber + 1,
      firstPlayerId: this.state.players[firstIdx].id,
    };
  }

  /** 게임 진행 중 명시적 나가기 — player를 state에서 제거. 3명 미만이면 게임 강제 종료. */
  removePlayer(clientId: string): { ended: boolean; roundResult?: RoundResult } {
    const idx = this.state.players.findIndex((p) => p.id === clientId);
    if (idx < 0) return { ended: false };

    const wasCurrentTurn = this.state.players[this.state.currentPlayerIndex]?.id === clientId;
    const wasLastPlayer = this.state.lastPlayerId === clientId;

    const newPlayers = this.state.players.filter((p) => p.id !== clientId);

    // 인원 3명 미만 → 게임 강제 종료 (남은 패 그대로 정산)
    if (newPlayers.length < 3) {
      this.state = { ...this.state, players: newPlayers, phase: 'scoring' };
      const result = calculateScoring(newPlayers);
      const updated = applyExchanges(newPlayers, result.exchanges).map((p) => ({ ...p, hand: [] }));
      this.state = { ...this.state, players: updated };
      return { ended: true, roundResult: result };
    }

    // 인원 충분 → 계속 진행. 현재 turn이거나 lastPlayer였으면 적절히 조정
    let nextIdx = this.state.currentPlayerIndex;
    if (wasCurrentTurn || idx <= this.state.currentPlayerIndex) {
      nextIdx = Math.max(0, this.state.currentPlayerIndex - (idx <= this.state.currentPlayerIndex ? 1 : 0));
      if (nextIdx >= newPlayers.length) nextIdx = 0;
    }

    this.state = {
      ...this.state,
      players: newPlayers,
      currentPlayerIndex: nextIdx,
      lastPlay: wasLastPlayer ? null : this.state.lastPlay,
      lastPlayerId: wasLastPlayer ? null : this.state.lastPlayerId,
      passCount: 0,
    };
    // currentPlayer가 손패 0개면 다음으로
    if (this.state.players[this.state.currentPlayerIndex]?.hand.length === 0) {
      this.advanceTurn();
    }
    return { ended: false };
  }

  playTiles(playerId: string, tileIds: string[]): { ok: boolean; reason?: string; roundResult?: RoundResult } {
    if (this.state.phase !== 'playing') return { ok: false, reason: '게임 진행 중이 아닙니다.' };

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { ok: false, reason: '현재 차례가 아닙니다.' };

    const tiles = tileIds.map((id) => currentPlayer.hand.find((t) => t.id === id)).filter(Boolean) as Tile[];
    if (tiles.length !== tileIds.length) return { ok: false, reason: '유효하지 않은 타일입니다.' };

    const config = getGameConfig(this.playerCount, this.mode);
    const combination = detectCombination(tiles, config.maxNumber);
    if (!combination) return { ok: false, reason: '유효하지 않은 조합입니다.' };

    if (this.state.lastPlay && !canPlay(combination, this.state.lastPlay)) {
      return { ok: false, reason: '더 강한 패를 내야 합니다.' };
    }

    this.hasPlayedThisRound = true;

    // 타일 제거
    const newHand = currentPlayer.hand.filter((t) => !tileIds.includes(t.id));
    this.updatePlayerHand(playerId, newHand);

    this.state = {
      ...this.state,
      lastPlay: combination,
      lastPlayerId: playerId,
      passCount: 0,
    };

    // 손패 소진 → 라운드 종료
    if (newHand.length === 0) {
      return this.endRound();
    }

    this.advanceTurn();
    return { ok: true };
  }

  pass(playerId: string): { ok: boolean; reason?: string; newLeader?: string } {
    if (this.state.phase !== 'playing') return { ok: false, reason: '게임 진행 중이 아닙니다.' };

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { ok: false, reason: '현재 차례가 아닙니다.' };

    const activePlayers = this.state.players.filter((p) => p.hand.length > 0);
    const newPassCount = this.state.passCount + 1;

    // 선을 제외한 나머지 모두 패스 → 새 선 결정
    if (newPassCount >= activePlayers.length - 1 && this.state.lastPlayerId) {
      const newLeaderIdx = this.state.players.findIndex((p) => p.id === this.state.lastPlayerId);
      this.state = {
        ...this.state,
        currentPlayerIndex: newLeaderIdx,
        lastPlay: null,
        lastPlayerId: null,
        passCount: 0,
      };
      return { ok: true, newLeader: this.state.players[newLeaderIdx].id };
    }

    this.state = { ...this.state, passCount: newPassCount };
    this.advanceTurn();
    return { ok: true };
  }

  private endRound(): { ok: boolean; roundResult: RoundResult } {
    const result = calculateScoring(this.state.players);
    const updatedPlayers = applyExchanges(this.state.players, result.exchanges).map((p) => ({
      ...p,
      hand: [],
    }));
    this.state = { ...this.state, phase: 'scoring', players: updatedPlayers };
    return { ok: true, roundResult: result };
  }

  private advanceTurn(): void {
    const total = this.state.players.length;
    let next = (this.state.currentPlayerIndex + 1) % total;
    // 패를 다 낸 플레이어는 건너뜀
    let safety = 0;
    while (this.state.players[next].hand.length === 0 && safety < total) {
      next = (next + 1) % total;
      safety++;
    }
    this.state = { ...this.state, currentPlayerIndex: next };
  }

  private updatePlayerHand(playerId: string, newHand: Tile[]): void {
    this.state = {
      ...this.state,
      players: this.state.players.map((p) => (p.id === playerId ? { ...p, hand: newHand } : p)),
    };
  }

  // 특정 플레이어 시점의 게임 상태 반환 (다른 플레이어 패는 개수만)
  getClientState(forPlayerId: string): ClientGameState {
    const clientPlayers: ClientPlayer[] = this.state.players.map((p) => {
      if (p.id === forPlayerId) {
        return { ...p, handCount: p.hand.length, hand: p.hand };
      }
      return { id: p.id, name: p.name, chips: p.chips, isConnected: p.isConnected, handCount: p.hand.length };
    });

    return {
      config: getGameConfig(this.playerCount, this.mode),
      hasPlayedThisRound: this.hasPlayedThisRound,
      phase: this.state.phase,
      players: clientPlayers,
      currentPlayerIndex: this.state.currentPlayerIndex,
      lastPlay: this.state.lastPlay,
      lastPlayerId: this.state.lastPlayerId,
      passCount: this.state.passCount,
      roundNumber: this.state.roundNumber,
      firstPlayerId: this.state.firstPlayerId,
    };
  }

  getPhase() { return this.state.phase; }
  getCurrentPlayerId() { return this.state.players[this.state.currentPlayerIndex]?.id; }
  getPlayerCount() { return this.state.players.length; }

  setPlayerConnection(playerId: string, isConnected: boolean): void {
    this.state = {
      ...this.state,
      players: this.state.players.map((p) => (p.id === playerId ? { ...p, isConnected } : p)),
    };
  }
}
