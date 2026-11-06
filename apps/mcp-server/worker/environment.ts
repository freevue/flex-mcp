import type { StateDatabase } from "../src/registration/stateDatabase.ts";

export type WorkerEnvironment = {
  BRIDGE: DurableObjectNamespace;
  FLEX_PUBLIC_ORIGIN?: string;
};

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
