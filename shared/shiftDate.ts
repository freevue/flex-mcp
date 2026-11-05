export function shiftDate(date: string, days: number): string {
  const utcDate = new Date(`${date}T00:00:00Z`);
  utcDate.setUTCDate(utcDate.getUTCDate() + days);
  return utcDate.toISOString().slice(0, 10);
}
