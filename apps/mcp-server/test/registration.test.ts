import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeMcpCaller, resolveBrowserBinding, revokeAccess } from "../src/access/index.ts";
import { consumeBridgeTicket, createAccessState, issueAgentKey, issueBridgeTicket, issuePairingCode,
  openStateDatabase, redeemPairingCode, verifyAgentKey, verifyDeviceKey } from "../src/registration/index.ts";

test("등록 코드는 만료·재사용을 거부하고 다시 등록하면 이전 키와 접속권이 해제된다", context => {
  const database = openStateDatabase(":memory:");
  context.after(() => database.close());
  const code = issuePairingCode(database, "owner-alpha", 0);
  assert.equal(redeemPairingCode(database, code, 600_000), null);
  const fresh = issuePairingCode(database, "owner-alpha", 600_000);
  assert.equal(redeemPairingCode(database, code, 1), null);
  const first = redeemPairingCode(database, fresh, 600_001);
  assert.ok(first);
  assert.equal(redeemPairingCode(database, fresh, 600_002), null);
  const ticket = issueBridgeTicket(database, first.deviceKey, 600_003);
  assert.ok(ticket);
  const replacement = redeemPairingCode(database, issuePairingCode(database, "owner-alpha", 600_004), 600_005);
  assert.ok(replacement);
  assert.notEqual(replacement.bindingId, first.bindingId);
  assert.equal(verifyDeviceKey(database, first.deviceKey), null);
  assert.equal(consumeBridgeTicket(database, ticket, 600_006), null);
});

test("사용자별 키가 등록을 선택하고 접속권을 한 번만 사용한다", context => {
  const database = openStateDatabase(":memory:");
  context.after(() => database.close());
  const access = createAccessState(database);
  const owners = ["owner-alpha", "owner-beta"];
  const [alpha, beta] = owners.map(ownerId => {
    const agent = issueAgentKey(database, ownerId);
    const registration = redeemPairingCode(database, issuePairingCode(database, ownerId));
    assert.ok(registration);
    const identity = verifyAgentKey(database, agent.key);
    assert.ok(identity);
    const caller = authorizeMcpCaller(identity, access);
    assert.ok(caller.ok);
    assert.equal(caller.value.bindingId, registration.bindingId);
    const expired = issueBridgeTicket(database, registration.deviceKey, 0);
    assert.ok(expired);
    assert.equal(consumeBridgeTicket(database, expired, 30_000), null);
    const ticket = issueBridgeTicket(database, registration.deviceKey);
    assert.ok(ticket);
    assert.deepEqual(consumeBridgeTicket(database, ticket), { ownerId, bindingId: registration.bindingId });
    assert.equal(consumeBridgeTicket(database, ticket), null);
    return caller.value;
  });
  assert.notEqual(alpha.bindingId, beta.bindingId);
  assert.equal(resolveBrowserBinding({ ...alpha, bindingId: beta.bindingId }, access).ok, false);
  assert.equal(revokeAccess(alpha, { kind: "profile", bindingId: beta.bindingId }, access, { active: new Map(), pending: new Map() }).ok, false);
  assert.equal(resolveBrowserBinding(beta, access).ok, true);
});
