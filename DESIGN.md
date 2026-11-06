---
name: flex MCP 확장
description: Chrome 확장 팝업의 연결, 승인 대기, 재연결과 근무 요약에 쓰는 시각 기준입니다.
colors:
  surface: "#FFFFFF"
  surface-subtle: "#F7F6F8"
  approval-tint: "#F5F0FF"
  text: "#242029"
  muted: "#5B5364"
  quiet: "#706778"
  primary: "#6D28D9"
  primary-text: "#FFFFFF"
  success: "#166534"
  warning: "#92400E"
  danger: "#991B1B"
  border: "#E8E3EB"
typography:
  metadata:
    fontFamily: "system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: "system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: "ui-monospace, Menlo, Consolas, monospace"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
rounded:
  control: 8px
  panel: 12px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
components:
  popup-title:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.heading}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.control}"
    padding: 8px 16px
  field-help:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
  approval-code:
    backgroundColor: "{colors.approval-tint}"
    textColor: "{colors.primary}"
    typography: "{typography.code}"
  status-divider:
    backgroundColor: "{colors.border}"
  status-meta:
    typography: "{typography.metadata}"
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.quiet}"
  status-online:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
  status-attention:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warning}"
  status-error:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
---

# Chrome 확장 화면 설계

## Overview

이 기준은 [확장 화면 구성 계획](docs/features/extension-ui-plan.md)에 적용합니다. 사용자는 자신의 Chrome 연결을 승인하고 상태를 확인합니다. 브라우저 권한 창처럼 차분하고 정확하게 표현합니다. 승인 대기에는 사용자가 에이전트에 보낼 코드를 강조합니다.

## Colors

흰색 화면과 채도가 낮은 배경을 사용합니다. 보라색은 주 버튼, 승인 코드와 키보드 포커스에 씁니다. 상태는 작은 점과 텍스트를 함께 표시합니다. 녹색은 연결, 주황색은 끊김, 빨간색은 오류를 뜻합니다.

## Typography

제목은 화면의 목적을 말합니다. 본문은 현재 상태와 다음 행동을 설명합니다. 팝업에는 승인 코드를 고정폭 글꼴로 표시합니다.

## Layout

팝업은 폭 320px을 기준으로 한 열을 사용합니다. 상태가 바뀌어도 제목과 16px 안쪽 여백을 유지합니다. 간격은 4px 단위로 맞춥니다. 화면 폭이 좁거나 글자를 확대해도 입력과 버튼이 가로로 잘리지 않게 합니다.

## Components

상태 행은 `MCP 연결`과 `Flex 연결`을 별도로 표시합니다. 소켓이 없으면 연결 화면에 코드 발급 버튼을 둡니다. 승인 대기에는 코드와 복사 버튼을 둡니다. 사용자는 기존 에이전트 대화에서 승인을 요청합니다. 두 연결이 활성화되면 상태 아래에 근무 요약을 둡니다. 남은 시간은 휴무 반영 전과 후를 같은 너비로 표시합니다. 등록을 유지한 채 연결이 끊겼으면 재연결 버튼을 둡니다.

## Do's and Don'ts

버튼과 입력은 키보드로 조작할 수 있게 합니다. 상태가 바뀌면 보조 기술이 변경을 읽을 수 있게 합니다. 팝업에는 서버 주소와 채널 ID를 표시하지 않습니다. 팝업은 승인 대기 중에만 코드를 표시합니다. 요청 키, 확장 키와 에이전트 키는 표시하지 않습니다. Flex 결과는 승인한 근무 요약에서만 표시합니다. 카드와 상태에 그라데이션, 광택 또는 반복 장식을 넣지 않습니다.

[승인 코드](docs/components/approval-code.md), [연결 상태 행](docs/components/connection-rows.md), [근무 요약](docs/components/work-summary.md)은 팝업에서 같은 글꼴과 색을 사용합니다.
