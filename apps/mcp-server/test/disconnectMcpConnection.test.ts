import assert from "node:assert/strict";
import { test } from "node:test";
import { failure, success } from "../../../shared/index.ts";
import { authorizeMcpCaller, disconnectMcpConnection } from "../src/access/index.ts";
import { attachBrowserBridge, forwardFlexQuery } from "../src/bridge/index.ts";
import type { RelayContext } from "../src/bridge/index.ts";
import { approveDevicePairing, claimDevicePairing, startChannelInvitation, startDevicePairing } from "../src/registration/devicePairing.ts";
import { createAccessState, openStateDatabase, secretDigest, verifyDeviceKey } from "../src/registration/index.ts";

test("UT-disconnectMcpConnection-01~02: 요청한 키의 대기 조회만 폐기하고 마지막 키에서 소켓을 닫는다", async (context) => {
  const database = openStateDatabase(":memory:");
  context.after(() => database.close());
  const started = startDevicePairing(database);
  assert.ok(started);
  const firstKey = approveDevicePairing(database, started.approvalCode);
  assert.ok(firstKey);
  const paired = claimDevicePairing(database, started.requestKey);
  assert.equal(paired.status, "registered");
  const binding = verifyDeviceKey(database, paired.registration.deviceKey);
  assert.ok(binding);
  const invitation = startChannelInvitation(database, paired.registration.deviceKey);
  assert.ok(invitation.ok);
  const secondKey = approveDevicePairing(database, invitation.value.approvalCode);
  assert.ok(secondKey);
  const relay: RelayContext = {
    access: createAccessState(database, true),
    registry: { active: new Map(), pending: new Map() },
    timeoutMs: 5_000,
    maxPending: 2
  };
  const authorize = (key: string) => authorizeMcpCaller({ callerId: secretDigest(key), ownerId: binding.ownerId }, relay.access);
  const first = authorize(firstKey);
  const second = authorize(secondKey);
  assert.ok(first.ok && second.ok);

  let closed = false;
  const socket = {
    ...binding,
    isOpen: () => !closed,
    send: () => {},
    close: () => {
      closed = true;
    },
    onClose: () => {},
    onReply: () => {}
  };
  assert.ok(attachBrowserBridge(binding, socket, relay.registry).ok);
  const firstQuery = forwardFlexQuery(first.value, { kind: "leave" }, relay);
  const secondQuery = forwardFlexQuery(second.value, { kind: "leave" }, relay);
  assert.equal(relay.registry.pending.size, 2);

  assert.deepEqual(disconnectMcpConnection(first.value, database, relay), success({ status: "disconnected", chromeRegistration: "preserved" }));
  assert.deepEqual(await firstQuery, failure("ACCESS_DENIED"));
  assert.equal(relay.registry.pending.size, 1);
  assert.equal(closed, false);
  assert.ok(authorize(secondKey).ok);
  const replacement = startDevicePairing(database, paired.registration.deviceKey);
  assert.ok(replacement);

  assert.deepEqual(disconnectMcpConnection(second.value, database, relay), success({ status: "disconnected", chromeRegistration: "removed" }));
  assert.deepEqual(await secondQuery, failure("ACCESS_DENIED"));
  assert.equal(closed, true);
  assert.equal(relay.registry.active.size, 0);
  assert.equal(verifyDeviceKey(database, paired.registration.deviceKey), null);
  assert.equal(approveDevicePairing(database, replacement.approvalCode), null);
});
