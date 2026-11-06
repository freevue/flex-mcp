import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeMcpCaller, resolveBrowserBinding, revokeAccess } from "../src/access/index.ts";
import { approveDevicePairing, claimDevicePairing, consumeBridgeTicket, createAccessState, issueAgentKey, issueBridgeTicket, issuePairingCode,
  openStateDatabase, redeemPairingCode, secretDigest, startChannelInvitation, startDevicePairing, verifyAgentKey, verifyDeviceKey } from "../src/registration/index.ts";

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
  assert.equal(issueBridgeTicket(database, first.deviceKey, 600_003, true), null);
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

test("만료와 재사용을 거부하고 확장이 교체 등록을 수령할 때만 이전 연결을 회수한다", context => {
  const database = openStateDatabase(":memory:");
  context.after(() => database.close());
  const expired = startDevicePairing(database, "", 0);
  assert.ok(expired);
  assert.equal(approveDevicePairing(database, expired.approvalCode, 300_000), null);
  assert.deepEqual(claimDevicePairing(database, expired.requestKey, 300_000), { status: "unavailable" });

  const started = startDevicePairing(database, "", 300_001);
  assert.ok(started);
  const firstKey = approveDevicePairing(database, started.approvalCode, 300_002);
  assert.ok(firstKey);
  assert.equal(approveDevicePairing(database, started.approvalCode, 300_003), null);
  const access = createAccessState(database, true);
  assert.equal(access.findOwner(secretDigest(firstKey)), null);
  assert.deepEqual(claimDevicePairing(database, firstKey, 300_004), { status: "unavailable" });
  const first = claimDevicePairing(database, started.requestKey, 300_005);
  assert.equal(first.status, "registered");
  const channel = access.findOwner(secretDigest(firstKey));
  assert.ok(channel);

  const replacement = startDevicePairing(database, first.registration.deviceKey, 300_006);
  assert.ok(replacement);
  const secondKey = approveDevicePairing(database, replacement.approvalCode, 300_007);
  assert.ok(secondKey);
  assert.equal(access.findOwner(secretDigest(firstKey)), channel);
  assert.equal(access.findOwner(secretDigest(secondKey)), null);
  const second = claimDevicePairing(database, replacement.requestKey, 300_008);
  assert.equal(second.status, "registered");
  assert.notEqual(second.registration.bindingId, first.registration.bindingId);
  assert.equal(verifyDeviceKey(database, first.registration.deviceKey), null);
  assert.equal(access.findOwner(secretDigest(firstKey)), null);
  assert.equal(access.findOwner(secretDigest(secondKey)), channel);
});

test("초대 코드는 만료되고 등록을 교체하면 추가 키와 승인 전 코드를 폐기한다", context => {
  const database = openStateDatabase(":memory:");
  context.after(() => database.close());
  const first = startDevicePairing(database, "", 0);
  assert.ok(first && approveDevicePairing(database, first.approvalCode, 1));
  const paired = claimDevicePairing(database, first.requestKey, 2);
  assert.equal(paired.status, "registered");
  const { deviceKey } = paired.registration;
  const expired = startChannelInvitation(database, deviceKey, 3);
  assert.ok(expired.ok);
  assert.equal(approveDevicePairing(database, expired.value.approvalCode, 300_003), null);
  const invite = startChannelInvitation(database, deviceKey, 300_004);
  const unused = startChannelInvitation(database, deviceKey, 300_004);
  assert.ok(invite.ok && unused.ok);
  const extraKey = approveDevicePairing(database, invite.value.approvalCode, 300_005);
  assert.ok(extraKey);
  const access = createAccessState(database, true);
  assert.ok(access.findOwner(secretDigest(extraKey)));
  const replacement = startDevicePairing(database, deviceKey, 300_006);
  assert.ok(replacement && approveDevicePairing(database, replacement.approvalCode, 300_007));
  assert.equal(claimDevicePairing(database, replacement.requestKey, 300_008).status, "registered");
  assert.equal(access.findOwner(secretDigest(extraKey)), null);
  assert.equal(approveDevicePairing(database, unused.value.approvalCode, 300_009), null);
});
