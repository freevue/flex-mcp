import { isDate, timezone } from "../../../shared/index.ts";
import type { DateRange } from "../../../shared/index.ts";
import { shiftDate } from "../../../shared/shiftDate.ts";

export { shiftDate, timezone };
export type { DateRange };
type OptionalRange = Partial<DateRange>;

export function seoulDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function resolveRange(input: OptionalRange, fallback: DateRange): DateRange {
  const { from, to } = input;
  if (from === undefined && to === undefined) return fallback;
  if (from === undefined || to === undefined) throw new Error("시작일과 종료일을 함께 지정하세요.");
  if (!isDate(from) || !isDate(to)) throw new Error("조회 날짜는 YYYY-MM-DD 형식이어야 합니다.");
  if (from > to) throw new Error("종료일은 시작일과 같거나 그 이후여야 합니다.");
  if (Date.parse(to) - Date.parse(from) > 30 * 86_400_000) throw new Error("한 번에 최대 31일을 조회할 수 있습니다.");
  return { from, to };
}
