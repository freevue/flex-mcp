import { isDate } from "../../../../shared/index.ts";

export type ActiveWorkSnapshot = {
  date: string;
  ongoing: { startMs: number; breaks: readonly { startMs: number; endMs: number | null }[] } | null;
};

const minuteMs = 60_000;
const dayMs = 86_400_000;

function isTimestamp(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

/** 확정 집계에 오늘의 진행 근무 시간을 더합니다. @see wiki/unit/flex/resolveTodayActualMinutes.md */
export function resolveTodayActualMinutes(
  recordedMinutes: number,
  date: string,
  sampledAtMs: number,
  before: ActiveWorkSnapshot | null,
  after: ActiveWorkSnapshot | null
): number | null {
  if (!isTimestamp(recordedMinutes) || !isDate(date) || !isTimestamp(sampledAtMs)) return null;
  const midnight = Date.parse(`${date}T00:00:00+09:00`);
  if (sampledAtMs < midnight || sampledAtMs >= midnight + dayMs || before?.date !== date || after?.date !== date) return null;

  const previous = before.ongoing;
  const current = after.ongoing;
  if (!previous || !current) return previous === current ? recordedMinutes : null;
  const { startMs, breaks } = current;
  if (previous.startMs !== startMs || !isTimestamp(startMs) || startMs > sampledAtMs || previous.breaks.length !== breaks.length) return null;

  const workStart = Math.max(midnight, startMs);
  let breakMs = 0;
  let previousStart = startMs;
  let countedUntil = workStart;
  let hasOpenBreak = false;
  for (const [index, interval] of breaks.entries()) {
    const earlier = previous.breaks[index];
    if (earlier?.startMs !== interval.startMs || earlier.endMs !== interval.endMs) return null;
    if (interval.endMs === null && hasOpenBreak) return null;
    hasOpenBreak ||= interval.endMs === null;
    const end = interval.endMs ?? sampledAtMs;
    if (!isTimestamp(interval.startMs) || !isTimestamp(end) || interval.startMs < previousStart || end < interval.startMs) return null;
    const boundedEnd = Math.min(end, sampledAtMs);
    breakMs += Math.max(0, boundedEnd - Math.max(countedUntil, interval.startMs));
    countedUntil = Math.max(countedUntil, boundedEnd);
    previousStart = interval.startMs;
  }

  const total = recordedMinutes + Math.floor((sampledAtMs - workStart - breakMs) / minuteMs);
  return Number.isSafeInteger(total) ? total : null;
}
