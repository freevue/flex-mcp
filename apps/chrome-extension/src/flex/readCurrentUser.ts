import { failure, success } from "../../../../shared/index.ts";
import type { FlexRequestFailure, Outcome } from "../../../../shared/index.ts";
import { readFlexJson } from "./readFlexJson.ts";
import type { BrowserUser, FlexPageContext } from "./types.ts";

export async function readCurrentUser(context: FlexPageContext, signal: AbortSignal):
  Promise<Outcome<BrowserUser, FlexRequestFailure>> {
  const reply = await readFlexJson(context, { kind: "currentUser" }, signal);
  if (!reply.ok) return reply;
  const { userRef } = reply.value;
  return typeof userRef === "string" && userRef.trim() ? success({ userRef }) : failure("FLEX_READ_FAILED");
}
