export type VerifiedOwnerIdentity = { ownerId: string };
export type VerifiedCallerIdentity = { callerId: string };
export type BrowserBinding = { ownerId: string; profileId: string };
export type AuthorizedCaller = VerifiedCallerIdentity & BrowserBinding;
export type AccessState = {
  binding: BrowserBinding | null;
  allowedCallers: ReadonlySet<string>;
};
export type AccessFailure = "CALLER_UNVERIFIED" | "ACCESS_DENIED";
export type RevocationTarget = { kind: "caller"; callerId: string } | { kind: "profile"; profileId: string };
