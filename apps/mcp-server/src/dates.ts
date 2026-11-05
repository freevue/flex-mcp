export const timezone = "Asia/Seoul";

export type DateRange = { from: string; to: string };
type OptionalRange = Partial<DateRange>;

export function seoulDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function shiftDate(date: string, days: number) {
  const utcDate = new Date(`${date}T00:00:00Z`);
  utcDate.setUTCDate(utcDate.getUTCDate() + days);
  return utcDate.toISOString().slice(0, 10);
}

export function resolveRange(input: OptionalRange, fallback: DateRange): DateRange {
  const { from, to } = input;
  if (from === undefined && to === undefined) return fallback;
  if (from === undefined || to === undefined) throw new Error("시작일과 종료일을 함께 지정하세요.");
  if (from > to) throw new Error("종료일은 시작일과 같거나 그 이후여야 합니다.");
  if (to > shiftDate(from, 30)) throw new Error("한 번에 최대 31일을 조회할 수 있습니다.");
  return { from, to };
}
