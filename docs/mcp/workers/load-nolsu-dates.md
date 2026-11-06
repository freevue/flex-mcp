# loadNolsuDates

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 서버가 연결한 정책의 월별 놀수 날짜를 읽습니다. 월 설정이 없으면 null입니다. 휴무가 없는 달로 확인했다면 빈 배열입니다.

```typescript
declare function loadNolsuDates(policyId: string, month: string): readonly string[] | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `policyId` | `string` | 서버가 해당 채널에 연결할 정책 ID입니다. |
| `month` | `string` | 한국 시간의 YYYY-MM입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-LOAD-NOLSU-DATES-01 | 설정 없는 달과 명시적으로 비운 달을 조회합니다. | null과 빈 배열을 구분합니다. |
| TC-W-LOAD-NOLSU-DATES-02 | 서로 다른 정책에 같은 월을 등록합니다. | 다른 정책의 날짜를 읽지 않습니다. |
