import { success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import { resolveBrowserBinding } from "./resolveBrowserBinding.ts";
import { revokeAccess } from "./revokeAccess.ts";
import type { AuthorizedCaller } from "./types.ts";
import type { RelayContext } from "../bridge/index.ts";
import { runStateTransaction } from "../registration/stateDatabase.ts";
import type { StateDatabase } from "../registration/stateDatabase.ts";

/** MCP 키와 마지막 Chrome 등록을 해제합니다. @see wiki/unit/mcp/disconnectMcpConnection.md */
export function disconnectMcpConnection(
  caller: AuthorizedCaller,
  database: StateDatabase,
  relay: RelayContext
): Outcome<{ status: "disconnected"; chromeRegistration: "preserved" | "removed" }, "ACCESS_DENIED"> {
  const { access, registry } = relay;
  return runStateTransaction(database, () => {
    const binding = resolveBrowserBinding(caller, access);
    if (!binding.ok) return binding;
    const revoked = revokeAccess(caller, { kind: "caller", callerId: caller.callerId }, access, registry);
    if (!revoked.ok) return revoked;
    if (access.findBinding(caller.ownerId)) {
      return success({ status: "disconnected", chromeRegistration: "preserved" } as const);
    }
    const removed = revokeAccess(caller, { kind: "profile", bindingId: binding.value.bindingId }, access, registry);
    if (!removed.ok) throw new Error("마지막 Chrome 등록을 지우지 못했습니다.");
    database.prepare("DELETE FROM channel_pairing WHERE replaces_binding_id = ?").run(binding.value.bindingId);
    return success({ status: "disconnected", chromeRegistration: "removed" } as const);
  });
}
