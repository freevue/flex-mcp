import { createAccessState, issueAgentKey, issuePairingCode, openStateDatabase, requireOwnerId } from "./index.ts";

const [, , action, identifier, ...remaining] = process.argv;
const file = process.env.FLEX_STATE_FILE;
if (!file || file === ":memory:" || !identifier || remaining.length
  || !["agent", "agent-approve", "pair", "revoke-agent", "revoke-browser"].includes(action)) {
  throw new Error("FLEX_STATE_FILE을 설정하고 agent, agent-approve, pair, revoke-agent 또는 revoke-browser 명령을 실행하세요.");
}
requireOwnerId(identifier);
const database = openStateDatabase(file);
try {
  if (action === "agent" || action === "agent-approve") {
    console.log(JSON.stringify(issueAgentKey(database, identifier, action === "agent-approve")));
  } else if (action === "pair") {
    console.log(issuePairingCode(database, identifier));
  } else {
    const access = createAccessState(database);
    if (action === "revoke-agent") {
      const ownerId = access.findOwner(identifier);
      if (ownerId) access.removeCaller(ownerId, identifier);
    } else {
      database.exec("BEGIN IMMEDIATE");
      try {
        database.prepare("DELETE FROM pair_codes WHERE owner_id = ?").run(identifier);
        database.prepare("DELETE FROM device_pairing WHERE owner_id = ?").run(identifier);
        const binding = access.findBinding(identifier);
        if (binding) access.removeBinding(identifier, binding.bindingId);
        database.exec("COMMIT");
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
    }
    console.log("지정한 권한이나 등록을 해제했습니다.");
  }
} finally {
  database.close();
}
