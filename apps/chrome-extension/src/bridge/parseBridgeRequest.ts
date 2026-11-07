import { failure, hasKeys, isBridgeQuery, isRecord, isRequestId, success } from "../../../../shared/index.ts";
import type { BridgeRequest, Outcome } from "../../../../shared/index.ts";

export function parseBridgeRequest(value: unknown): Outcome<BridgeRequest, "INVALID_BRIDGE_MESSAGE"> {
  if (!isRecord(value) || !hasKeys(value, ["requestId", "query"]) || !isRequestId(value.requestId) || !isBridgeQuery(value.query))
    return failure("INVALID_BRIDGE_MESSAGE");
  return success({ requestId: value.requestId, query: value.query });
}
