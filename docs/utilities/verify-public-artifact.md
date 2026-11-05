# verifyPublicArtifact

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/ci-artifacts.md) · [공통 타입](../UTILITY_TYPES.md)

배포 파일에 공개 허용 범위의 내용만 있는지 확인합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `scripts/verifyPublicArtifact.ts` |
| 상태 | 구현 예정 |
| 출력 | 검사 통과 또는 실패입니다. 실패한 항목의 종류를 기록합니다. |
| 실패 | 금지 파일, 허용되지 않은 경로, 필요한 파일 누락은 실패입니다. 민감한 값 자체를 로그에 쓰지 않습니다. |

## 함수 계약

```typescript
declare function verifyPublicArtifact(archivePath: string, policy: PublicArtifactPolicy): Promise<ArtifactCheckResult>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `archivePath` | `string` | 필수 | 검사할 서버 패키지 또는 확장 ZIP의 로컬 경로입니다. |
| `policy` | `PublicArtifactPolicy` | 필수 | 대상 앱의 압축 형식, 필수 파일과 공개 제외 기준입니다. |

## 테스트 케이스

아래 조건에서 `verifyPublicArtifact`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-VERIFY-PUBLIC-ARTIFACT-01 | 서버 패키지와 확장 ZIP을 각 앱의 기준으로 검사합니다. 파일이 모두 허용 범위에 있습니다. | 두 산출물이 각각 통과합니다. | 예정 |
| TC-U-VERIFY-PUBLIC-ARTIFACT-02 | 확장 ZIP에서 필수 `manifest.json`을 빼고 검사합니다. | 필수 파일 누락으로 실패합니다. | 예정 |
| TC-U-VERIFY-PUBLIC-ARTIFACT-03 | 합성 패키지에 로컬 환경 파일을 넣습니다. | 금지 파일 포함으로 실패합니다. 파일 내용을 로그에 쓰지 않습니다. | 예정 |
| TC-U-VERIFY-PUBLIC-ARTIFACT-04 | 압축에 허용된 루트 밖을 가리키는 경로를 넣습니다. | 경로를 거부합니다. 작업 경로 밖에 파일을 만들지 않습니다. | 예정 |
