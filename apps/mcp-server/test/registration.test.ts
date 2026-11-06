import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeMcpCaller, resolveBrowserBinding, revokeAccess } from "../src/access/index.ts";
import { approveDevicePairing, claimDevicePairing, consumeBridgeTicket, createAccessState, issueAgentKey, issueBridgeTicket, issuePairingCode,
  openStateDatabase, redeemPairingCode, startDevicePairing, verifyAgentKey, verifyDeviceKey } from "../src/registration/index.ts";

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

test("승인 만료와 권한 회수 시 기존 등록을 유지하고 새 승인은 수령할 때만 교체한다", context => {
  const database = openStateDatabase(":memory:");
  context.after(() => database.close());
  const ownerId = "owner-alpha";
  const first = redeemPairingCode(database, issuePairingCode(database, ownerId, 0), 1);
  assert.ok(first);
  const agent = issueAgentKey(database, ownerId, true);
  const identity = verifyAgentKey(database, agent.key);
  assert.ok(identity);
  const expired = startDevicePairing(database, 0);
  assert.ok(expired);
  assert.equal(approveDevicePairing(database, identity, expired.approvalCode, 300_000), false);
  assert.deepEqual(claimDevicePairing(database, expired.requestKey, 300_000), { status: "unavailable" });
  const revoked = startDevicePairing(database, 300_000);
  assert.ok(revoked);
  assert.equal(approveDevicePairing(database, identity, revoked.approvalCode, 300_001), true);
  const access = createAccessState(database);
  access.removeCaller(ownerId, agent.callerId);
  assert.deepEqual(claimDevicePairing(database, revoked.requestKey, 300_002), { status: "unavailable" });
  assert.equal(access.findBinding(ownerId)?.bindingId, first.bindingId);
  const newIdentity = verifyAgentKey(database, issueAgentKey(database, ownerId, true).key);
  assert.ok(newIdentity);
  const request = startDevicePairing(database, 300_003);
  assert.ok(request);
  assert.equal(approveDevicePairing(database, newIdentity, request.approvalCode, 300_004), true);
  assert.equal(access.findBinding(ownerId)?.bindingId, first.bindingId);
  const claim = claimDevicePairing(database, request.requestKey, 300_005);
  assert.equal(claim.status, "registered");
  assert.equal(verifyDeviceKey(database, first.deviceKey), null);
});
