import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authorizeMfa, validateContact, allowContact } from '../server/security.ts';
const token = (aal: string, sub = 'user') => `header.${Buffer.from(JSON.stringify({ aal, sub })).toString('base64url')}.signature`;
function client(role = 'admin', valid = true) {
  return { auth: { getUser: async () => ({ data: { user: valid ? { id: 'user' } : null }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role }, error: null }) }) }) }) } as never;
}
test('privileged API requires verified identity, matching subject, AAL2 and allowed role', async () => {
  assert.equal(await authorizeMfa(client(), token('aal1'), ['admin']), false);
  assert.equal(await authorizeMfa(client('admin', false), token('aal2'), ['admin']), false);
  assert.equal(await authorizeMfa(client(), token('aal2', 'other'), ['admin']), false);
  assert.equal(await authorizeMfa(client('membre'), token('aal2'), ['admin']), false);
  assert.equal(await authorizeMfa(client(), 'malformed', ['admin']), false);
  assert.equal(await authorizeMfa(client(), token('aal2'), ['admin']), true);
});
test('contact rejects non-string, oversized and header-injection input', () => {
  const body = { name: 'Alice', email: 'alice@example.com', message: 'Bonjour' };
  assert.ok(validateContact(body));
  assert.equal(validateContact({ ...body, name: {} }), null);
  assert.equal(validateContact({ ...body, message: 'a'.repeat(5001) }), null);
  assert.equal(validateContact({ ...body, email: 'a@example.com\r\nBcc: x@y.com' }), null);
  assert.equal(validateContact({ ...body, message: ' ' }), null);
});
test('contact throttle blocks sixth message and expires', () => {
  for (let i = 0; i < 5; i++) assert.equal(allowContact('test', 1000), true);
  assert.equal(allowContact('test', 1000), false);
  assert.equal(allowContact('test', 901001), true);
});
