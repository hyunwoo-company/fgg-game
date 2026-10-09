import { GameEngine } from '../game/GameEngine';
import type { PlayerCount, GameMode } from '@fgg/game-logic';

export interface RoomPlayer {
  id: string;       // stable clientId (재연결 시에도 유지)
  name: string;
  socketId: string; // 재연결 시 갱신
  isReady: boolean;
  isConnected: boolean;
  /** disconnect된 시점 (재연결 grace period 산정용) */
  disconnectedAt?: number;
}

export class Room {
  readonly id: string;
  private players: RoomPlayer[] = [];
  private engine: GameEngine | null = null;
  readonly createdAt: number;
  lastActivityAt: number;
  /** 게임 모드 — 'recommended' (기본) 또는 'full' (모든 인원 1~15) */
  mode: GameMode;

  constructor(id: string, mode: GameMode = 'recommended') {
    this.id = id;
    this.createdAt = Date.now();
    this.lastActivityAt = Date.now();
    this.mode = mode;
  }

  /** 동일 clientId의 disconnected player 존재 시 reconnect, 없으면 새로 추가 */
  addPlayer(player: Omit<RoomPlayer, 'isConnected'>): boolean {
    this.lastActivityAt = Date.now();
    // 같은 clientId의 player가 이미 있으면 reconnect로 처리
    const existing = this.players.find((p) => p.id === player.id);
    if (existing) {
      existing.socketId = player.socketId;
      existing.isConnected = true;
      existing.disconnectedAt = undefined;
      return true;
    }
    if (this.players.length >= 5) return false;
    if (this.engine) return false;
    this.players.push({ ...player, isConnected: true });
    return true;
  }

  /** disconnect 처리 — 대기실/게임 중 모두 isConnected: false만 표시 (splice 안 함, grace period 동안 reconnect 가능) */
  removePlayer(socketId: string): RoomPlayer | null {
    const player = this.players.find((p) => p.socketId === socketId);
    if (!player) return null;
    player.isConnected = false;
    player.disconnectedAt = Date.now();
    if (this.engine) {
      this.engine.setPlayerConnection(player.id, false);
    }
    this.lastActivityAt = Date.now();
    return player;
  }

  /** 명시적 나가기 (사용자가 leave 버튼 눌렀을 때) — 즉시 splice */
  leavePlayer(clientId: string): RoomPlayer | null {
    const idx = this.players.findIndex((p) => p.id === clientId);
    if (idx < 0) return null;
    const [removed] = this.players.splice(idx, 1);
    if (this.engine) {
      this.engine.removePlayer(clientId);
    }
    this.lastActivityAt = Date.now();
    return removed;
  }

  /** grace period(기본 30s) 지난 disconnected player를 정리 — 게임 중엔 정리 안 함 */
  purgeStaleDisconnects(graceMs: number = 30_000): RoomPlayer[] {
    if (this.engine) return [];
    const now = Date.now();
    const removed: RoomPlayer[] = [];
    this.players = this.players.filter((p) => {
      if (p.isConnected) return true;
      if (!p.disconnectedAt) return true; // 안전장치
      if (now - p.disconnectedAt > graceMs) {
        removed.push(p);
        return false;
      }
      return true;
    });
    return removed;
  }

  reconnectPlayer(clientId: string, newSocketId: string): RoomPlayer | null {
    const player = this.players.find((p) => p.id === clientId);
    if (!player) return null;
    player.socketId = newSocketId;
    player.isConnected = true;
    if (this.engine) {
      this.engine.setPlayerConnection(clientId, true);
    }
    return player;
  }

  getPlayers(): RoomPlayer[] {
    return [...this.players];
  }

  getPlayer(socketId: string): RoomPlayer | undefined {
    return this.players.find((p) => p.socketId === socketId);
  }

  getPlayerById(clientId: string): RoomPlayer | undefined {
    return this.players.find((p) => p.id === clientId);
  }

  getPlayerCount(): number {
    return this.players.length;
  }

  getHostId(): string | null {
    return this.players[0]?.id ?? null;
  }

  canStart(): boolean {
    return this.players.length >= 3 && this.players.length <= 5 && !this.engine;
  }

  startGame(): boolean {
    if (!this.canStart()) return false;
    const count = this.players.length as PlayerCount;
    this.engine = new GameEngine(
      this.players.map((p) => ({ id: p.id, name: p.name })),
      count,
      this.mode,
    );
    this.engine.startRound();
    return true;
  }

  getEngine(): GameEngine | null {
    return this.engine;
  }

  /**
   * 방이 비었는지 — 모든 player가 disconnect된 상태이고, grace period(60s) 지났을 때.
   * 페이지 전환/짧은 disconnect에도 즉시 삭제되지 않도록 보호.
   */
  isEmpty(): boolean {
    if (this.players.length === 0) return true;
    if (!this.players.every((p) => !p.isConnected)) return false;
    // 모든 disconnectedAt 중 가장 최근 시점 기준
    const latest = Math.max(
      ...this.players.map((p) => p.disconnectedAt ?? this.lastActivityAt),
      this.lastActivityAt,
    );
    return Date.now() - latest > 60_000;
  }

  toJSON() {
    return {
      id: this.id,
      players: this.players.map(({ id, name, isReady, isConnected }) => ({ id, name, isReady, isConnected })),
      playerCount: this.players.length,
      isPlaying: !!this.engine,
      mode: this.mode,
    };
  }
}
