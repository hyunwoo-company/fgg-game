import assert from 'node:assert/strict';
import { GameEngine } from '../src/game/GameEngine';
import { detectCombination, getGameConfig } from '@fgg/game-logic';
import type { GameMode, PlayerCount, TileNumber } from '@fgg/game-logic';
import { getMaxNumber, findPlayableCombinations } from '../../web/src/lib/suggestions';
import { buildMockGame } from '../../web/src/lib/mockGame';

for (const count of [3, 4, 5] as PlayerCount[]) {
  for (const mode of ['recommended', 'full'] as GameMode[]) {
    const ids = Array.from({ length: count }, (_, i) => `p${i}`);
    const engine = new GameEngine(ids.map(id => ({ id, name: id })), count, mode);
    engine.startRound();
    let state = engine.getClientState(ids[0]);
    const config = getGameConfig(count, mode);
    assert.deepEqual(state.config, config);
    assert.equal(state.hasPlayedThisRound, false);
    const leader = engine.getCurrentPlayerId()!;
    const hand = engine.getClientState(leader).players.find(p => p.id === leader)!.hand!;
    assert(hand.some(t => t.id === 'cloud-3'));
    assert.equal(state.firstPlayerId, leader);
    const max = getMaxNumber(state);
    const wrap = [max-3,max-2,max-1,max,1].map((n,i)=>({id:`wrap-${n}`,number:n as TileNumber,suit: i%2 ? 'sun' as const : 'cloud' as const}));
    assert.equal(detectCombination(wrap,max)?.type,'straight');
    assert(findPlayableCombinations(wrap,null,max).some(c=>c.type==='straight'));
    assert(engine.playTiles(leader,[hand.find(t=>t.id !== 'cloud-3')!.id]).ok);
    for(let i=0;i<count-1;i++)assert(engine.pass(engine.getCurrentPlayerId()!).ok);
    state=engine.getClientState(leader);
    assert.equal(state.lastPlay,null);
    assert.equal(state.hasPlayedThisRound,true);
    assert.equal(engine.getCurrentPlayerId(),leader);
    engine.setPlayerConnection(leader,false);
    engine.setPlayerConnection(leader,true);
    assert.equal(engine.getClientState(leader).hasPlayedThisRound,true);
    if(count>3){
      const departure=ids.find(id=>id!==leader)!;
      engine.removePlayer(departure);
      state=engine.getClientState(leader);
      assert.equal(state.players.length,count-1);
      assert.deepEqual(state.config,config);
      assert.equal(getMaxNumber(state),max);
      assert.equal(state.hasPlayedThisRound,true);
    }
    engine.startRound();
    assert.equal(engine.getClientState(leader).hasPlayedThisRound,false);
    assert.equal(engine.getClientState(leader).config!.playerCount,engine.getPlayerCount());
    console.log(`PASS snapshot ${mode} ${count}p: max=${max}, first/new lead, reconnect, departure, next round`);
  }
  const mock=buildMockGame(count,{noLastPlay:true});
  assert.equal(mock.state.currentPlayerIndex,0);
  assert.equal(mock.state.hasPlayedThisRound,false);
  assert.equal(mock.state.players[0].hand!.filter(t=>t.id==='cloud-3').length,1);
  assert.equal(mock.state.players[0].hand!.length,getGameConfig(count).tilesPerPlayer);
  assert.equal(new Set(mock.state.players[0].hand!.map(t=>t.id)).size,mock.state.players[0].hand!.length);
}

for (const count of [3, 4, 5] as PlayerCount[]) {
  for (const myTurn of [false, true]) {
    const state = buildMockGame(count, { myTurn }).state;
    assert.equal(state.lastPlayerId, `p${count-1}`);
    assert.equal(state.currentPlayerIndex, myTurn ? 0 : 1);
    assert.equal(state.passCount, myTurn ? 0 : 1);
  }
}
console.log('PASS mock 3/4/5p: first-player ownership, unique hand IDs and coherent turn/pass snapshots');
