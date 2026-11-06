export type VerifiedOwnerIdentity = { ownerId: string };
export type VerifiedCallerIdentity = { callerId: string; ownerId: string };
export type BrowserBinding = { ownerId: string; bindingId: string };
export type AuthorizedCaller = VerifiedCallerIdentity & BrowserBinding;
export type AccessState = {
  findOwner: (callerId: string) => string | null;
  findBinding: (ownerId: string) => BrowserBinding | null;
  removeCaller: (ownerId: string, callerId: string) => boolean;
  removeBinding: (ownerId: string, bindingId: string) => boolean;
};
export type AccessFailure = "CALLER_UNVERIFIED" | "ACCESS_DENIED";
export type RevocationTarget = { kind: "caller"; callerId: string } | { kind: "profile"; bindingId: string };
