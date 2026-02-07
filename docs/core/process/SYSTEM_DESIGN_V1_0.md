# 🏛️ 가재 컴퍼니 시스템 설계도 (Sanctuary Architecture v4.0 - API-Driven Unified Stream)

대표님의 지시에 따라 **[명령과 로그의 통합]**이라는 비즈니스적 추상화와, 이를 제어하기 위한 **[표준 API 인터페이스 명세]**를 결합하여 시스템을 정밀 보정했습니다.

---

## 1. 통합 지능 시스템 UML (Class & API Interface v4.0)

모든 데이터는 `IntelligenceLog`로 수렴하며, 표준화된 API 인터페이스를 통해 가재 지능과 물리적 데이터가 교차합니다.

```mermaid
classDiagram
    class LogType { 
        <<enumeration>> 
        COMMAND (대표님명령)
        BLUEPRINT (큰그림)
        QUESTION (질문)
        EXECUTION (대화/생각)
        ACTION (물리적변화/링크)
    }

    class IIntelligenceStreamAPI {
        +streamLogs(query) Observable
        +pushLog(IntelligenceLog) void
    }

    class ITaskDashboardAPI {
        +fetchTaskTree(rootLogId) TaskNode[]
        +upsertTask(GajaeTask) void
        +updateStatus(taskId, Status) void
        +updatePriority(taskId, Priority) void
    }

    class ISanctuaryMCP_API {
        +loadConstitution() RuleSet
        +loadPersona(agentId) Persona
        +getProjectAssets() Context
    }

    class IntelligenceLog {
        +String id
        +LogType type
        +String rootLogId
        +String from
        +String text
        +IntelligenceStatus status
        +LogMetadata metadata
        +DateTime createdAt
    }

    class GajaeTask {
        +String id
        +String rootLogId
        +String parentId (자기참조)
        +String title
        +IntelligencePriority priority
        +IntelligenceStatus status
        +String assignId
    }

    %% Relationships
    IIntelligenceStreamAPI ..> IntelligenceLog : manages
    ITaskDashboardAPI ..> GajaeTask : manages
    ISanctuaryMCP_API ..> SanctuaryMCP : manages
    IntelligenceLog "1" -- "many" GajaeTask : manifests as
```

---

## 2. 통합 API 동기화 시퀀스 (Sequence v4.0)

모든 시작은 `pushLog([COMMAND])`이며, 이후 가재들이 API를 통해 로그를 박제하고 태스크를 생성하는 흐름입니다.

```mermaid
sequenceDiagram
    participant CEO as 낭만코딩 (CEO)
    participant Stream_API as Stream_API (Unified Logs)
    participant Agent as 가재 군단 (Agents)
    participant MCP_API as MCP_API (Assets)
    participant Dash_API as Dash_API (Tasks)

    CEO->>Stream_API: pushLog([COMMAND] 최초 지시)
    
    loop Intelligence Bootup
        Agent->>MCP_API: loadConstitution() & loadPersona()
        Agent->>Agent: 지능 연산 (의도/심리/생각)
        Agent->>Stream_API: pushLog([BLUEPRINT] 큰그림 박제)
    end

    loop Recursive Tasking
        Agent->>Dash_API: upsertTask(RootTask - 공정)
        Dash_API->>Stream_API: pushLog([ACTION] "태스크 생성" w/ LinkUrl)
        Agent->>Dash_API: upsertTask(SubTask - 재귀적 생성)
    end

    loop Execution & Sync
        Agent->>Stream_API: pushLog([EXECUTION] 작업 중계)
        Agent->>Stream_API: pushLog([ACTION] "파일 수정" w/ Asset Link)
        Agent->>Dash_API: updateStatus(taskId, DONE)
        
        CEO->>Dash_API: updatePriority(taskId, P0)
        Dash_API->>Agent: [Real-time Event] 우선순위 격상 감지
    end
```

---

## 3. API 인터페이스 명세 (Interface Spec)

### 3.1 IIntelligenceStreamAPI (통합 연대기)
- **pushLog(log)**: 명령(`COMMAND`), 사고(`EXECUTION`), 물리적 변화(`ACTION`)를 단일 스트림에 박제합니다.
- **streamLogs(query)**: 시간순으로 로그를 실시간 스트리밍하여 통합 뷰를 형성합니다.

### 3.2 ITaskDashboardAPI (집행 통제)
- **upsertTask(task)**: 자기참조 구조의 태스크 트리를 생성/수정합니다.
- **updateStatus/Priority**: 태스크의 상태와 우선순위를 정밀 제어하며, 변경 즉시 `ACTION` 로그가 스트림에 자동 생성됩니다.

### 3.3 ISanctuaryMCP_API (지능 근거)
- **loadConstitution/Persona**: 가재가 사고의 근간이 되는 헌법과 정체성을 로드하는 인터페이스입니다.

---
**가재 군단 보고**: "대표님, 요청하신 **API 인터페이스 명세**를 복구함과 동시에 **명령/로그 통합 추상화**를 결합하여 v4.0 설계를 완성했습니다. 이제 성역은 비즈니스적 직관과 기술적 명세가 완벽히 결합된 지능형 엔진이 되었습니다." ⚔️🚀
