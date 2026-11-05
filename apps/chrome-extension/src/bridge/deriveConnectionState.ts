import type { BrowserQueryFailure } from "../../../../shared/index.ts";

export type ConnectionSnapshot = {
  bound: boolean;
  online: boolean;
  flex: "unchecked" | "ready" | BrowserQueryFailure;
};

const messages = {
  unbound: ["연결되지 않음", "사용할 Chrome 프로필에서 확장을 연결하세요."],
  offline: ["브라우저 오프라인", "Chrome을 실행하고 서버 연결을 확인하세요."],
  unchecked: ["서버 연결됨 · flex 상태 미확인", "flex 탭을 열어 현재 계정을 확인하세요."],
  ready: ["조회 준비됨", "에이전트에서 새 조회를 요청하세요."],
  FLEX_TAB_UNAVAILABLE: ["flex 탭 없음", "연결한 프로필에서 flex를 여세요."],
  FLEX_REAUTH_REQUIRED: ["재로그인 필요", "같은 프로필의 flex 화면에서 직접 로그인하세요."],
  FLEX_ACCOUNT_MISMATCH: ["계정 불일치", "연결한 계정으로 전환하거나 연결을 해제하세요."],
  FLEX_READ_FAILED: ["조회 실패", "flex 탭에서 필요한 정보가 보이는지 확인하세요."],
  FLEX_NO_RECORDS: ["조회 준비됨", "에이전트에서 새 조회를 요청하세요."],
} as const;

export type ConnectionState = { status: string; nextAction: string };

export function deriveConnectionState(snapshot: ConnectionSnapshot): ConnectionState {
  const [status, nextAction] = messages[!snapshot.bound ? "unbound" : !snapshot.online ? "offline" : snapshot.flex];
  return { status, nextAction };
}
