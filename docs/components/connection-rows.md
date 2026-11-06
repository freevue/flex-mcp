# 연결 상태 행

[상태 화면](../screens/status.md)

`renderConnectionRows(flex)`는 MCP 상태와 Flex 상태를 표시합니다. 상태 화면에서 MCP 상태는 연결됨입니다. `flex`는 미연결 또는 합성 상태입니다.

색은 글자를 보조합니다. 연결 상태만으로 Flex 로그인이나 실제 조회 가능 여부를 판단하지 않습니다.

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-UI-CONNECTION-ROWS-01 | MCP만 연결합니다. | MCP는 연결됨, Flex는 미연결로 표시합니다. |
| TC-UI-CONNECTION-ROWS-02 | 합성 모드로 연결합니다. | Flex 행에 합성 모드라고 표시합니다. |
