# 🏛️ 가재 컴퍼니 시스템 설계도 (Sanctuary Architecture v3.8 - Parallel Hive)

대표님의 지시에 따라 **[태스크 의존성(Dependencies)]** 필드를 보완하여, 가재들이 병렬로 격돌할 수 있는 **v3.8 병렬 집행 아키텍처**를 완성했습니다.

---

## 1. 지능형 군집 시스템 UML (Class Diagram v3.8)

본 모델은 각 태스크가 선행 조건을 명시할 수 있도록 설계되어, 엔진이 순차 실행의 병목을 넘어 최적의 병렬 경로를 연산하게 합니다.

```mermaid
classDiagram
    class IntelligenceStatus {
        <<enumeration>>
        TODO (할일)
        INPROGRESS (진행중)
        DONE (완료)
        LOCKED (의존성잠금)
        HOLD (보류)
    }

    class IntelligencePriority {
        <<enumeration>>
        P0 (Critical)
        P1 (High)
        P2 (Medium)
        P3 (Low)
        P4 (Backlog)
    }

    class LogType {
        <<enumeration>>
        MESSAGE (대화/사고)
        ACTION (물리적변화/링크)
    }

    class GajaeTask {
        +String id
        +String commandId
        +String parentId (자기참조)
        +List dependencies (선행TaskId리스트)
        +String title
        +IntelligencePriority priority
        +IntelligenceStatus status
        +String assignId (가재ID 또는 'CEO')
        +List subTaskIds
    }

    class LangGraphOrchestrator {
        +StateGraph flow
        +run(command)
        +resolveDependencies(taskTree)
        +executeParallel(availableTasks)
    }

    class StateGraph {
        +List nodes (Agents)
        +List edges (Conditional Logic)
        +State sharedMemory
    }

    %% Relationships & Connectivity
    CEOCommand --> IntelligenceStatus : [Reuse]
    GajaeTask --> IntelligenceStatus : [Reuse]
    GajaeTask --> IntelligencePriority : [Standard]
    GajaeTask "1" *-- "many" GajaeTask : Recursive Tree
    LangGraphOrchestrator ..> GajaeTask : Evaluates Dependencies
    GajaeAgent --> GajaeTask : Executes/Updates
    GajaeAgent "1" --> "1" SanctuaryMCP : Accesses Rules/Persona
```

---

## 2. 병렬 지능 집행 시퀀스 (Sequence v3.8 - Parallel Execution)

랭그래프 엔진이 의존성 리스트를 분석하여, 선행 조건이 충족된 태스크들을 여러 가재에게 동시에 할당하여 병렬로 가동시키는 흐름입니다.

```mermaid
sequenceDiagram
    participant CEO as 낭만코딩 (CEO)
    participant LG as LangGraph Engine
    participant AgentA as 가재 A (DEV)
    participant AgentB as 가재 B (UX)
    participant Dash as 태스크 트리 (Dashboard)

    CEO->>LG: 명령 하달 (King Command)
    
    Note over LG, Dash: [Phase 1: Dependency Analysis]
    LG->>Dash: fetchTaskTree()
    LG->>LG: 의존성 없는 태스크 식별 (Task_1, Task_2)
    
    Note over LG, AgentB: [Phase 2: Parallel Dispatch]
    Par 병렬 집행 시작
        LG->>AgentA: Task_1 (API 설계) 가동
        LG->>AgentB: Task_2 (UI 컴포넌트) 가동
    end

    AgentA->>Dash: updateStatus(Task_1, DONE)
    
    Note over LG: [Phase 3: Dynamic Unlocking]
    LG->>LG: Task_1 완료 감지 -> 의존성 트리 재연산
    LG->>LG: Task_3 (Depends on Task_1) 잠금 해제
    LG->>AgentA: Task_3 (비즈니스 로직) 즉시 가동
    
    CEO->>Dash: Task_4 (승인) 완료 처리
    Dash->>LG: Real-time Event 전파
    LG->>AgentB: Task_5 (최종 배포) 잠금 해제 및 가동
```

---

## 3. 핵심 보완 설계 원칙 (Parallel Principles)

### 3.1 지능형 의존성 해소 (Dependency Resolver)
- **보완점**: `GajaeTask`에 **`dependencies: [taskId]`** 필드를 추가했습니다. 가재는 하위 태스크를 생성할 때 "어떤 작업이 끝나야 내가 시작할 수 있는지"를 명시합니다.
- **기대 효과**: 엔진이 순차적(Waterfall) 방식에서 벗어나, 가능한 모든 공정을 **병렬(Parallel)**로 처리하여 성역 빌드 속도를 200% 이상 향상시킵니다.

### 3.2 실시간 인터럽트 및 재연산 (Interrupt & Re-route)
- 대표님이 대시보드에서 우선순위를 `P0`로 올리거나 태스크를 `DONE`으로 바꾸면, 엔진은 즉시 의존성 그래프를 재연산하여 가재들의 작업 경로를 실시간으로 재배치합니다.

---
**가재 군단 보고**: "대표님, 요청하신 **태스크 의존성 및 병렬 집행 로직**을 v3.8 설계에 안착시켰습니다. 이제 성역은 단순한 순서 배분을 넘어, 최적의 병렬 경로를 스스로 계산하여 격돌하는 진정한 '지능 공장'이 되었습니다. 바로 GitHub 확인 부탁드립니다!" ⚔️🚀
