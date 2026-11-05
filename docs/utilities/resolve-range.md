# resolveRange

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/work-hours.md) · [현재 코드](../../apps/mcp-server/src/dates.ts) · [공통 타입](../UTILITY_TYPES.md)

두 날짜가 한 조회 기간을 이루는지 확인합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/dates.ts` |
| 상태 | 현재 구현 |
| 출력 | 두 날짜가 없으면 기본 기간입니다. 둘 다 있으면 시작과 끝을 포함하는 최대 31일입니다. |
| 실패 | 한 날짜만 주거나, 시작일이 늦거나, 31일을 넘으면 오류를 던집니다. 기본 기간은 호출자가 먼저 확인합니다. |

## 함수 계약

```typescript
declare function resolveRange(input: Partial<DateRange>, fallback: DateRange): DateRange;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `input` | `Partial<DateRange>` | 필수 | 호출자가 형식을 검사한 `from`과 `to`입니다. 둘 다 생략할 수 있습니다. |
| `fallback` | `DateRange` | 필수 | 호출자가 먼저 확인한 기본 기간입니다. 두 날짜를 생략한 경우에만 사용합니다. |

## 테스트 케이스

아래 조건에서 `resolveRange`을 호출합니다. 기존 테스트는 [서버 테스트](../../apps/mcp-server/test/public-server.test.ts)에 있습니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-RESOLVE-RANGE-01 | 입력 기간은 `2027-01-01`부터 `2027-01-31`까지입니다. | 같은 시작일과 종료일을 반환합니다. | 기존 테스트 |
| TC-U-RESOLVE-RANGE-02 | 입력 기간은 `2027-01-01`부터 `2027-02-01`까지입니다. | 오류를 던집니다. 오류 문구에 `최대 31일`이 들어갑니다. | 기존 테스트 |
| TC-U-RESOLVE-RANGE-03 | `input`에 날짜가 없고 `fallback`에는 유효한 두 날짜가 있습니다. | 기본 기간을 반환합니다. | 예정 |
| TC-U-RESOLVE-RANGE-04 | 두 날짜가 모두 `2027-01-01`입니다. | 하루인 기간을 반환합니다. | 예정 |
| TC-U-RESOLVE-RANGE-05 | `input`에 `from`만 지정합니다. | `시작일과 종료일을 함께 지정하세요.` 오류를 던집니다. | 기존 테스트 · MCP 경유 |
| TC-U-RESOLVE-RANGE-06 | `from`이 `2027-01-02`, `to`가 `2027-01-01`입니다. | `종료일은 시작일과 같거나 그 이후여야 합니다.` 오류를 던집니다. | 예정 |
