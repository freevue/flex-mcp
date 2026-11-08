# flex_get_company_holidays

[도구 목록](../README.md) · [명세](../../../wiki/feature/flex-company-holidays.md)

본인에게 적용되는 휴일을 날짜순으로 조회합니다. 연결 키와 시작일, 종료일이 필요합니다. 양 끝을 포함하여 한국 시간 기준 최대 31일입니다.

응답은 날짜, 이름과 휴일 유형을 담습니다. 대체공휴일은 `PUBLIC_HOLIDAY`에 포함됩니다. 회사 자체 휴일은 `CUSTOM_HOLIDAY`입니다.

공개 검증용 갈피는 예시만 반환합니다. 현재 개인 설치본은 휴일 그룹과 유형을 모두 확인한 조회 어댑터가 없어 `FLEX_SCOPE_UNAVAILABLE`을 반환합니다. 확인되지 않은 휴일을 분류하거나 빈 목록으로 표시하지 않습니다.
