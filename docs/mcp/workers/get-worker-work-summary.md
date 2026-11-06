# getWorkerWorkSummary

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 한 사용자와 현재 등록으로만 오늘, 월 누적, 월 전체 목표를 조회합니다. 월 전체와 구간 합이 같을 때만 놀수 목표를 뺍니다. 등록과 권한이 달라지면 요약 전체를 버립니다.

```typescript
declare function getWorkerWorkSummary(connectionKey: string, now: Date): Promise<Outcome<WorkSummaryResult, WorkerFailure>>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `connectionKey` | `string` | 코드 승인에서 받은 해당 채널의 연결 키입니다. |
| `now` | `Date` | 오늘과 이번 달을 결정할 기준 시각입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-GET-WORKER-WORK-SUMMARY-01 | 월 목표에 포함된 두 휴무를 설정합니다. | 날짜별 소정 근무 목표만 빼고 남은 시간 두 값을 반환합니다. |
| TC-W-GET-WORKER-WORK-SUMMARY-02 | 구간 합이 다르거나 월 설정이 없습니다. | 반영 값은 null입니다. |
| TC-W-GET-WORKER-WORK-SUMMARY-03 | 근무 조회 사이에 등록을 교체합니다. | 기존 등록의 부분 결과를 반환하지 않습니다. |
