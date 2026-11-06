import { randomUUID } from "node:crypto";
import { createSecret, requireOwnerId, secretDigest } from "../src/registration/stateDatabase.ts";

const [, , ownerId, flag, ...extra] = process.argv;
if (!ownerId || (flag !== undefined && flag !== "--approve") || extra.length) {
  throw new Error("사용자 ID와 선택 인자인 --approve를 입력하세요.");
}
requireOwnerId(ownerId);
const key = createSecret();
const agent = { callerId: randomUUID(), ownerId, keyDigest: secretDigest(key), canApprove: flag === "--approve" };
console.log(JSON.stringify({ key, agent }, null, 2));
