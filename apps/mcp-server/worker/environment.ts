import { hasKeys, isRecord } from "../../../shared/index.ts";
import { runStateTransaction, secretDigest } from "../src/registration/stateDatabase.ts";
import type { StateDatabase } from "../src/registration/stateDatabase.ts";

export type WorkerEnvironment = {
  BRIDGE: DurableObjectNamespace;
  FLEX_PUBLIC_ORIGIN?: string;
  FLEX_EXTENSION_IDS?: string;
  FLEX_WORKER_AGENTS?: string;
};

type AgentConfiguration = {
  callerId: string;
  ownerId: string;
  keyDigest: string;
  canApprove: boolean;
};

type WorkerConfiguration = { extensionOrigins: ReadonlySet<string>; agents: AgentConfiguration[] };
const idPattern = /^[A-Za-z0-9_-]{1,80}$/;

export function readWorkerConfiguration(environment: WorkerEnvironment): WorkerConfiguration | null {
  if (!environment.FLEX_WORKER_AGENTS || !environment.FLEX_EXTENSION_IDS) return null;
  const ids = environment.FLEX_EXTENSION_IDS.split(",").map(id => id.trim());
  if (ids.length > 128 || !ids.every(id => /^[a-p]{32}$/.test(id))) return null;
  const agents: AgentConfiguration[] = [];
  try {
    const input: unknown = JSON.parse(environment.FLEX_WORKER_AGENTS);
    if (!Array.isArray(input) || input.length < 1 || input.length > 128) return null;
    for (const entry of input as unknown[]) {
      if (!isRecord(entry) || !hasKeys(entry, ["callerId", "ownerId", "keyDigest", "canApprove"])
        || typeof entry.callerId !== "string" || !idPattern.test(entry.callerId)
        || typeof entry.ownerId !== "string" || !idPattern.test(entry.ownerId)
        || typeof entry.keyDigest !== "string" || !/^[a-f0-9]{64}$/.test(entry.keyDigest)
        || typeof entry.canApprove !== "boolean") return null;
      agents.push({ callerId: entry.callerId, ownerId: entry.ownerId, keyDigest: entry.keyDigest, canApprove: entry.canApprove });
    }
  } catch {
    return null;
  }
  if (new Set(agents.map(agent => agent.callerId)).size !== agents.length
    || new Set(agents.map(agent => agent.keyDigest)).size !== agents.length) return null;
  return { agents, extensionOrigins: new Set(ids.map(id => `chrome-extension://${id}`)) };
}

export function syncWorkerAgents(database: StateDatabase, agents: readonly AgentConfiguration[]): void {
  database.exec("CREATE TABLE IF NOT EXISTS worker_agent_snapshot (id INTEGER PRIMARY KEY CHECK(id = 1), digest TEXT NOT NULL)");
  const digest = secretDigest(JSON.stringify(agents));
  if (database.prepare("SELECT digest FROM worker_agent_snapshot WHERE id = 1").get()?.digest === digest) return;
  runStateTransaction(database, () => {
    database.exec("DELETE FROM approval_agents; DELETE FROM agents;");
    for (const { callerId, ownerId, keyDigest, canApprove } of agents) {
      database.prepare("INSERT INTO agents(caller_id, owner_id, digest) VALUES (?, ?, ?)").run(callerId, ownerId, keyDigest);
      if (canApprove) database.prepare("INSERT INTO approval_agents(caller_id) VALUES (?)").run(callerId);
    }
    database.exec("DELETE FROM bindings WHERE owner_id NOT IN (SELECT owner_id FROM agents)");
    database.exec(`DELETE FROM device_pairing WHERE owner_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM agents JOIN approval_agents USING(caller_id)
      WHERE agents.caller_id = device_pairing.caller_id AND agents.owner_id = device_pairing.owner_id
    )`);
    database.prepare("INSERT OR REPLACE INTO worker_agent_snapshot(id, digest) VALUES (1, ?)").run(digest);
  });
}

export function createWorkerDatabase(storage: DurableObjectStorage): StateDatabase {
  return {
    exec: sql => { storage.sql.exec(sql); },
    prepare: sql => ({
      get: (...parameters) => storage.sql.exec(sql, ...parameters).toArray()[0],
      run: (...parameters) => ({ changes: storage.sql.exec(sql, ...parameters).rowsWritten }),
    }),
    transactionSync: operation => storage.transactionSync(operation),
  };
}
