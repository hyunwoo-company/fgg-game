const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/lib/clientId.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const firstId = '11111111-1111-4111-8111-111111111111';
const secondId = '22222222-2222-4222-8222-222222222222';
const session = { roomId: 'ABC123', playerName: 'Player' };
const otherSession = { roomId: 'DEF456', playerName: 'Other' };

function storage(entries = {}, failWrites = false) {
  const values = new Map(Object.entries(entries));
  return {
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrites) throw new Error('Storage full');
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key),
  };
}

function api(local = storage(), saved = storage(), server = false) {
  const context = { exports: {}, crypto: { randomUUID: () => secondId } };
  if (!server) Object.assign(context, { window: {}, localStorage: local, sessionStorage: saved });
  vm.runInNewContext(compiled, context);
  return context.exports;
}

function equalSession(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

let local = storage({ old_client_id: firstId, unrelated: 'keep' });
let saved = storage({ old_session: JSON.stringify(session), unrelated: 'keep' });
let client = api(local, saved);
assert.equal(client.getClientId(), firstId);
assert.equal(local.getItem('fgg_client_id'), firstId);
assert.equal(local.getItem('old_client_id'), null);
assert.equal(local.getItem('unrelated'), 'keep');
equalSession(client.loadSession(), session);
assert.equal(saved.getItem('old_session'), null);
client.clearSession();
assert.equal(client.loadSession(), null);

local = storage({ fgg_client_id: firstId, old_client_id: secondId });
saved = storage({ fgg_session: JSON.stringify(session), old_session: JSON.stringify(otherSession) });
client = api(local, saved);
assert.equal(client.getClientId(), firstId);
equalSession(client.loadSession(), session);
assert.equal(local.getItem('old_client_id'), secondId);
assert.equal(saved.getItem('old_session'), JSON.stringify(otherSession));

local = storage({ old_client_id: 'invalid', second_client_id: firstId });
saved = storage({ old_session: '{', second_session: JSON.stringify(session) });
client = api(local, saved);
assert.equal(client.getClientId(), firstId);
equalSession(client.loadSession(), session);
assert.equal(local.getItem('old_client_id'), 'invalid');
assert.equal(saved.getItem('old_session'), '{');

local = storage({ old_client_id: firstId, other_client_id: secondId });
saved = storage({ old_session: JSON.stringify(session), other_session: JSON.stringify(otherSession) });
client = api(local, saved);
assert.equal(client.getClientId(), secondId);
assert.equal(local.getItem('old_client_id'), firstId);
assert.equal(local.getItem('other_client_id'), secondId);
assert.equal(client.loadSession(), null);
assert.equal(saved.getItem('fgg_session'), null);
client.clearSession();
assert.equal(saved.getItem('old_session'), JSON.stringify(session));

for (const invalid of ['null', '[]', '{}', '{"roomId":"ABC123","playerName":42}', '{"roomId":" ","playerName":"Player"}']) {
  saved = storage({ old_session: invalid });
  assert.equal(api(storage(), saved).loadSession(), null);
  assert.equal(saved.getItem('old_session'), invalid);
}
local = storage({ fgg_client_id: 'invalid', old_client_id: firstId });
saved = storage({ fgg_session: '[]', old_session: JSON.stringify(session) });
client = api(local, saved);
assert.equal(client.getClientId(), firstId);
equalSession(client.loadSession(), session);

local = storage({ old_client_id: firstId }, true);
saved = storage({ old_session: JSON.stringify(session) }, true);
client = api(local, saved);
assert.equal(client.getClientId(), firstId);
assert.equal(local.getItem('old_client_id'), firstId);
assert.equal(local.getItem('fgg_client_id'), null);
equalSession(client.loadSession(), session);
assert.equal(saved.getItem('old_session'), JSON.stringify(session));
client.clearSession();
assert.equal(client.loadSession(), null);

saved = storage();
client = api(storage(), saved);
client.saveSession(session.roomId, session.playerName);
equalSession(client.loadSession(), session);
client.clearSession();
assert.equal(client.loadSession(), null);
client = api(undefined, undefined, true);
assert.equal(client.getClientId(), '');
assert.equal(client.loadSession(), null);
assert.doesNotThrow(() => client.saveSession(session.roomId, session.playerName));
assert.doesNotThrow(() => client.clearSession());
console.log('clientId storage migration checks passed');
