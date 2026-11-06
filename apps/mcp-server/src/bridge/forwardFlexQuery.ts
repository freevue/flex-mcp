import { randomUUID } from "node:crypto";
import { failure, isQuery } from "../../../../shared/index.ts";
import type { FlexQuery, FlexResult, Outcome } from "../../../../shared/index.ts";
import { resolveBrowserBinding } from "../access/resolveBrowserBinding.ts";
import type { AuthorizedCaller } from "../access/types.ts";
import type { RelayContext, RelayFailure } from "./types.ts";

export async function forwardFlexQuery(caller: AuthorizedCaller, query: FlexQuery, context: RelayContext, markSynthetic = false):
  Promise<Outcome<FlexResult & { synthetic?: true }, RelayFailure>> {
  const { access, registry, timeoutMs, maxPending } = context;
  const binding = resolveBrowserBinding(caller, access);
  if (!binding.ok) return binding;
  if (!isQuery(query)) return failure("INVALID_BRIDGE_MESSAGE");
  const connection = registry.active.get(binding.value.bindingId);
  if (!connection || connection.ownerId !== binding.value.ownerId || !connection.isOpen()) return failure("BROWSER_OFFLINE");
  if (registry.pending.size >= maxPending) return failure("QUERY_LIMIT_REACHED");

  const requestId = randomUUID();
  const result = await new Promise<Outcome<FlexResult & { synthetic?: true }, RelayFailure>>(resolve => {
    function finish(outcome: Outcome<FlexResult, RelayFailure>, source?: "flex") {
      if (!registry.pending.delete(requestId)) return;
      clearTimeout(timer);
      resolve(outcome.ok && markSynthetic && source !== "flex"
        ? { ok: true, value: { ...outcome.value, synthetic: true } } : outcome);
    }
    const timer = setTimeout(() => finish(failure("QUERY_TIMEOUT")), timeoutMs);
    registry.pending.set(requestId, { caller, connection, query, finish });
    try {
      connection.send({ requestId, query });
    } catch {
      finish(failure("BROWSER_OFFLINE"));
    }
  });
  if (!resolveBrowserBinding(caller, access).ok) return failure("ACCESS_DENIED");
  if (result.ok && registry.active.get(binding.value.bindingId) !== connection) return failure("BROWSER_OFFLINE");
  return result;
}
