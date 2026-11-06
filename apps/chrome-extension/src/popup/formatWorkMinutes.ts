export function formatWorkMinutes(minutes: number | null): string {
  if (minutes === null) return "계산 정보 없음";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}시간 ${remainder}분` : `${hours}시간`;
}
