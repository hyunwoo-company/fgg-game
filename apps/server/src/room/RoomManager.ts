import { Room } from './Room';
import type { GameMode } from '@fgg/game-logic';

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  create(mode: GameMode = 'recommended'): Room {
    let id = generateRoomId();
    while (this.rooms.has(id)) id = generateRoomId();
    const room = new Room(id, mode);
    this.rooms.set(id, room);
    return room;
  }

  get(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  findBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.getPlayer(socketId)) return room;
    }
    return undefined;
  }

  findByClientId(clientId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.getPlayerById(clientId)) return room;
    }
    return undefined;
  }

  delete(id: string): void {
    this.rooms.delete(id);
  }

  cleanup(): void {
    for (const [id, room] of this.rooms.entries()) {
      if (room.isEmpty()) this.rooms.delete(id);
    }
  }
}
