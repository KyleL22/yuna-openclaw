# 📋 [PRD] Gajae-BIP Operation Room (작전 상황실)

## 1. 🎯 배경 및 목적 (Why & Goal)
*   **Background:** 현재 가재 컴퍼니의 에이전트(PM, PO, Dev 등)들이 각자 터미널에서 활동하고 있어, 전체적인 진행 상황과 리소스 상태를 파악하기 어렵습니다.
*   **Goal:** 모든 에이전트의 상태, 태스크 진행률, 시스템 리소스를 **단일 화면(Single Pane of Glass)**에서 모니터링하고 제어할 수 있는 웹 기반 대시보드를 구축합니다.
*   **Core Value:** **"Situational Awareness (상황 인식)"** - CEO가 시스템의 상태를 즉관적으로 인지하고 의사결정을 내릴 수 있게 돕습니다.

## 2. 👥 타겟 유저 (Who)
*   **Commander (CEO):** 전체 현황 파악 및 긴급 지시.
*   **Operator (PO/PM):** 태스크 우선순위 조정 및 병목 현상 관리.

## 3. 🛠️ 핵심 요구사항 (Requirements)

### A. 📡 실시간 상황판 (Live Dashboard)
1.  **Agent Status Grid:** 각 에이전트(PM, PO, Dev, QA)의 현재 상태(Idle, Working, Error, Offline)를 신호등(🟢, 🟡, 🔴)으로 표시.
2.  **Ticker:** 최근 발생한 중요 이벤트(태스크 완료, 오류 발생)를 뉴스 티커 형태로 상단 노출.

### B. 🗺️ 전술 지도 (Task Map)
1.  **Kanban View:** `INBOX` -> `PLAN` -> `DO` -> `REVIEW` -> `DONE` 상태의 태스크를 카드 형태로 시각화.
2.  **Drag & Drop:** PO가 카드를 드래그하여 우선순위를 변경하거나 상태를 강제 업데이트 가능.

### C. 🎛️ 지휘 통제 (Command Center)
1.  **Global Pause:** 비상 시 모든 에이전트 활동 일시 정지 버튼 (Big Red Button).
2.  **Quick Order:** 텍스트 입력창을 통해 자연어로 긴급 명령 하달 (CLI 연동).

### D. 📊 성과 분석 (Metrics - v2)
*   *(MVP 제외, 추후 고려)* 일일 처리 태스크 수, 에이전트별 가동률 그래프.

## 4. 📅 마일스톤 (Milestones)
*   **Phase 1 (MVP):** Next.js 기반의 읽기 전용(Read-only) 대시보드 구축 (로그 파일 파싱).
*   **Phase 2:** WebSocket 연동을 통한 실시간 상태 업데이트 및 제어 기능 추가.
*   **Phase 3:** 모바일 반응형 지원 및 알림(Notification) 기능 연동.

## 5. 📏 성공 지표 (Success Metrics)
*   **System Visibility:** 시스템 장애 인지 시점부터 조치까지의 시간 단축.
*   **Decision Speed:** 백로그 우선순위 정리 시간 50% 단축.
