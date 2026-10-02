/** Socket regression: recommended/full 3–5 players, first/new lead, reconnect, departures and a complete round.
 * Run from apps/server with NODE_PATH=../web/node_modules:
 * pnpm exec ts-node --transpile-only test/e2e_bot_test.ts (server localhost:3001)
 */
import assert from 'node:assert/strict';
import { io, Socket } from 'socket.io-client';
import { canPlay, detectCombination, getGameConfig } from '@lexio/game-logic';
import type { ClientGameState, GameMode, PlayerCount } from '@lexio/game-logic';

const SERVER = process.env.FGG_TEST_SERVER ?? 'http://localhost:3001';
const TIMEOUT = 30_000;
function once<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.off(event, receive); reject(new Error(`${event} timeout`)); }, TIMEOUT);
    const receive = (value: T) => { clearTimeout(timer); resolve(value); };
    socket.once(event, receive);
  });
}
async function emitFor<T>(socket: Socket, send: string, data: unknown, receive: string): Promise<T> {
  const pending = once<T>(socket, receive);
  socket.emit(send, data);
  return pending;
}
async function scenario(count: PlayerCount, mode: GameMode) {
  const bots = Array.from({ length: count }, (_, i) => {
    const id = `rules-${mode}-${count}-${i}-${Date.now()}`;
    return { id, socket: io(SERVER, { auth: { clientId: id }, autoConnect: false }), state: null as ClientGameState | null };
  });
  let roomId = '';
  try {
    await Promise.all(bots.map(async bot => { const ready = once(bot.socket, 'connect'); bot.socket.connect(); await ready; }));
    const created = await emitFor<{ roomId: string }>(bots[0].socket, 'room:create', { playerName: 'Bot0', mode }, 'room:created');
    roomId = created.roomId;
    for (const [i, bot] of bots.entries()) {
      if (i) await emitFor(bot.socket, 'room:join', { roomId, playerName: `Bot${i}` }, 'room:joined');
      bot.socket.on('game:stateSync', (state: ClientGameState) => { bot.state = state; });
      bot.socket.on('game:started', (state: ClientGameState) => { bot.state = state; });
    }
    const started = bots.map(bot => once<ClientGameState>(bot.socket, 'game:started'));
    bots[0].socket.emit('game:start', { roomId });
    const states = await Promise.all(started);
    const config = getGameConfig(count, mode);
    states.forEach((state, i) => {
      assert.deepEqual(state.config, config);
      assert.equal(state.hasPlayedThisRound, false);
      assert.equal(state.players.find(p => p.id === bots[i].id)!.handCount, config.tilesPerPlayer);
    });
    async function syncFrom(socket: Socket, event: string, payload: unknown): Promise<ClientGameState> {
      const pending = bots.map(bot => once<ClientGameState>(bot.socket, 'game:stateSync'));
      socket.emit(event, payload);
      const snapshots = await Promise.all(pending);
      return snapshots[bots.findIndex(bot => bot.socket === socket)];
    }
    const first = bots.find(bot => bot.id === states[0].firstPlayerId)!;
    const firstHand = first.state!.players.find(p => p.id === first.id)!.hand!;
    assert(firstHand.some(t => t.id === 'cloud-3'));
    // First player may lead with a different tile.
    let leadState = await syncFrom(first.socket, 'game:play', { roomId, tileIds: [firstHand.find(t => t.id !== 'cloud-3')!.id] });
    for (let i = 0; i < count - 1; i++) {
      const state = leadState;
      const current = bots.find(bot => bot.id === state.players[state.currentPlayerIndex].id)!;
      leadState = await syncFrom(current.socket, 'game:pass', { roomId });
    }
    assert.equal(leadState.lastPlay, null);
    assert.equal(leadState.hasPlayedThisRound, true);
    // Actual socket disconnect/reconnect with the stable authenticated client ID.
    first.socket.disconnect();
    const connected = once(first.socket, 'connect'); first.socket.connect(); await connected;
    const reconnected = await emitFor<ClientGameState>(first.socket, 'room:reconnect', { roomId }, 'game:stateSync');
    assert.deepEqual(reconnected.config, config);
    assert.equal(reconnected.lastPlay, null);
    assert.equal(reconnected.hasPlayedThisRound, true);

    let failure: Error | undefined;
    const end = once<{ state: ClientGameState }>(first.socket, 'game:roundEnd');
    const move = (bot: typeof bots[number], state: ClientGameState) => {
      if (state.phase !== 'playing' || state.players[state.currentPlayerIndex]?.id !== bot.id) return;
      const hand = state.players.find(p => p.id === bot.id)!.hand!;
      const candidate = hand.map(t => detectCombination([t])!).filter(c => !state.lastPlay || canPlay(c,state.lastPlay)).sort((a,b)=>a.strength-b.strength)[0];
      if(candidate) bot.socket.emit('game:play',{roomId,tileIds:candidate.tiles.map(t=>t.id)});
      else bot.socket.emit('game:pass',{roomId});
    };
    const handlers = bots.map(bot => {
      const handler = (state: ClientGameState) => move(bot,state);
      bot.socket.on('game:stateSync',handler);
      bot.socket.on('game:invalid',({reason}:{reason:string})=>{failure=new Error(reason);});
      return handler;
    });
    const current = bots.find(bot => bot.id === reconnected.players[reconnected.currentPlayerIndex].id)!;
    move(current,current.state!);
    const ended = await end;
    if(failure)throw failure;
    assert.equal(ended.state.phase,'scoring');
    bots.forEach((bot,i)=>bot.socket.off('game:stateSync',handlers[i]));
    const next = bots.map(bot=>once<ClientGameState>(bot.socket,'game:started'));
    bots.forEach(bot=>bot.socket.emit('game:ready',{roomId}));
    const nextStates = await Promise.all(next);
    assert.equal(nextStates[0].roundNumber,2);
    assert.equal(nextStates[0].hasPlayedThisRound,false);
    if(count>3){
      const observer=bots[0], departure=bots[count-1];
      const snapshot=await emitFor<ClientGameState>(observer.socket,'room:reconnect',{roomId},'game:stateSync');
      assert.equal(snapshot.players.length,count);
      const changed=once<ClientGameState>(observer.socket,'game:stateSync');
      departure.socket.emit('room:leave',{roomId});
      const after=await changed;
      assert.equal(after.players.length,count-1);
      assert.deepEqual(after.config,config);
    }
    console.log(`PASS socket ${mode} ${count}p: max ${config.maxNumber}, round completion, lead reset, reconnect, departure`);
  } finally {
    for(const bot of bots){ if(roomId)bot.socket.emit('room:leave',{roomId}); bot.socket.disconnect(); }
  }
}
(async()=>{
 for(const mode of ['recommended','full'] as GameMode[])for(const count of [3,4,5] as PlayerCount[])await scenario(count,mode);
})().catch(error=>{console.error(error);process.exitCode=1;});
