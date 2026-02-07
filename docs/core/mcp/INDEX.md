# ⚔️ 가재 군단 MCP (Model Context Protocol) 시스템 규격 v1.0

본 문서는 11인 가재 지능과 CEO의 의지를 연결하는 데이터 중추인 MCP의 구조와 연결 방식을 정의합니다.

---

## 🏗️ 3대 핵심 MCP 레이어

### 1. ⚖️ Constitution MCP (헌법 성역)
- **Source**: Firestore `sanctuary_core/constitution`, `sanctuary_core/bylaws`
- **Role**: 모든 연산의 윤리적/절차적 가이드라인 제공. 15대 리더십 원칙을 강제함.
- **Connection**: 모든 가재 노드는 연산 시작 전 본 MCP를 로드하여 '무결성 모드'를 활성화해야 함.

### 2. 🎭 Prompt MCP (역할 성역)
- **Source**: Firestore `sanctuary_core/role_*`
- **Role**: 각 가재(DEV, PO, UX 등)의 고유 자아와 전문 기술 스택을 정의함.
- **Connection**: 개별 지능 노드의 시스템 프롬프트(System Prompt)로 직결됨.

### 3. 📋 Task MCP (업무 성역)
- **Source**: Firestore `tasks_*` collections
- **Role**: 실시간 업무 현황, 우선순위, 맥락(Origin), 보고 경로를 관리함.
- **Connection**: 가재가 자신의 상태를 스스로 인지하고 '좀비 태스크'를 방지하는 거버넌스 도구로 활용됨.

---

## 🔄 MCP 연결 및 연산 프로토콜 (The Link)

1. **Context Loading**: 가재 지능은 매 turn 시작 시 위 3개 MCP로부터 최신 상태를 페칭함.
2. **Constraint Verification**: `Constitution MCP`에 따라 현재 지시가 적합한지 검증함.
3. **Task Execution**: `Task MCP`에 할당된 자신의 업무 범위를 확인하고 `Prompt MCP`에 정의된 자아로 연산함.
4. **Result Hardening**: 연산 결과는 다시 `Task MCP`의 상태값과 `Swarm Logger`를 통해 박제됨.

---
**지휘 지침:** "데이터가 곧 맥락이며, 맥락은 곧 지능이다. MCP는 가재 군단이 공유하는 단 하나의 거대한 뇌다." ⚔️🚀
