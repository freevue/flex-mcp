# approveForCaller

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 객체의 등록 저장소에서 승인 권한과 코드 만료를 확인합니다. 요청에 인증된 사용자를 연결합니다. 등록 교체는 확장이 수령할 때 수행합니다.

```typescript
declare function approveForCaller(identity: WorkerCaller, code: string): Promise<boolean>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `identity` | `WorkerCaller` | Worker에서 확인한 호출자와 승인 권한입니다. |
| `code` | `string` | 팝업이 표시한 일회용 승인 코드입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-APPROVE-FOR-CALLER-01 | 조회 권한만 있는 사용자나 같은 코드의 재사용을 보냅니다. | 승인하지 않습니다. |
| TC-W-APPROVE-FOR-CALLER-02 | 정상 승인 뒤 확장이 수령하기 전에 등록을 조회합니다. | 이전 등록을 유지합니다. |
