import type { BrowserBinding, AccessState } from "../src/access/index.ts";

export function createTestAccess(binding: BrowserBinding, callers: string[]): AccessState {
  const owners = new Map(callers.map(callerId => [callerId, binding.ownerId]));
  let current: BrowserBinding | null = binding;
  return {
    findOwner: callerId => owners.get(callerId) ?? null,
    findBinding: ownerId => current?.ownerId === ownerId ? current : null,
    removeCaller: (ownerId, callerId) => owners.get(callerId) === ownerId && owners.delete(callerId),
    removeBinding: (ownerId, bindingId) => {
      if (current?.ownerId !== ownerId || current.bindingId !== bindingId) return false;
      current = null;
      return true;
    },
  };
}
