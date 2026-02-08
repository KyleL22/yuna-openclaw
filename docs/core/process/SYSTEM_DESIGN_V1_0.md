# 🏛️ 가재 컴퍼니 시스템 설계 (Sanctuary Architecture v14.0 - The Complete Archive)

**[문서의 목적]**: 본 문서는 **OpenClaw (AI Agent)**에게 시스템 구축을 지시하기 위한 **최종 기술 명세서(Technical Specification)**입니다.
**[핵심 철학]**: "인간 CEO"와 "11명의 AI 가재 군단"이 **PC 환경**에서 공존하며, **비서가재(Biseo Gajae)**가 지능적 게이트키퍼로서 중재하고, 그 모든 과정은 **크로니클(Chronicle)**로 투명하게 기록됩니다.

---

## 1. 런타임 아키텍처 (Runtime Architecture)

**[물리적 환경]**: Mac (PC) + Telegram Bridge + Firestore Database.
**[코드베이스]**: `gajae-os` (TypeScript + LangGraph.js) -> **Orchestration Engine**

```mermaid
graph TD
    User["👤 CEO (Telegram)"] -->|Message| Bridge["🌉 Telegram Bot API"]
    Bridge -->|Webhook| Main["🖥️ 비서가재 (Main Agent)"]
    
    subgraph "Local Workspace"
        OS["⚙️ gajae-os (CLI)"]
        DB[("🔥 Firestore (Memory)")]
    end
    
    subgraph "Workers (Micro-Agents)"
        PM["👔 Manager"]
        PO["💡 PO"]
        DEV["💻 Dev"]
        QA["🧪 QA"]
    end

    Main -->|Exec CLI| OS
    OS -->|Read/Write| DB
    OS -- "Return Action" --> Main
    Main -- "Spawn" --> PM
    Main -- "Spawn" --> PO
    Main -- "Spawn" --> DEV
    
    %% All agents write to DB
    Main -.->|"[CEO_COMMAND]"| DB
    OS -.->|"[PROCESS_STATE]"| DB
    PM -.->|"[DECISION]"| DB
    PO -.->|"[PLAN]"| DB
    DEV -.->|"[CODE]"| DB
```

### 1.1 성역의 수호자들 (Sanctuary Squad - 11 Micro-Agents)
**[Concept]**: 12명의 가재는 **OpenClaw 상의 독립된 Agent ID**를 가집니다. `gajae-os`는 이들을 직접 실행하는 게 아니라, **`Action Plan`을 반환하여 Main Agent가 실행하게** 합니다.

| 코드 ID (`agentId`) | 한글 애칭 | 역할 (Role) | 비고 |
| :--- | :--- | :--- | :--- |
| `main` (biseo) | **비서가재** | 문지기 (Gatekeeper) | CEO 명령 수신, `gajae-os` 구동 |
| `pm` | **매니저가재** | 공정 관리 (Manager) | 스케줄링 및 공정 통제 |
| `po` | **기획가재** | 기획 (Product Owner) | 기획서 작성, 토론 주도 |
| `ba` | **분석가재** | 분석 (Business Analyst) | 요구사항 분석 |
| `ux` | **디자인가재** | 디자인 (UX/UI Designer) | 디자인 가이드 작성 |
| `dev` | **개발가재** | 개발 (Developer) | 코드 구현, 기술 검토(Reviewer) |
| `qa` | **품질가재** | 품질 (Quality Assurance) | 테스트 수행 |
| `hr` | **인사가재** | 인사 (HR Manager) | 리소스 관리 |
| `mkt` | **마케팅가재** | 마케팅 (Marketer) | 카피라이팅 |
| `legal` | **변호사가재** | 법무 (Legal Advisor) | 라이선스 검토 |
| `cs` | **민원가재** | 고객지원 (CS Specialist) | 응대 매뉴얼 작성 |

---

## 2. 데이터 모델 (Data Model Hierarchy)

### 2.1 UML Class Diagram (Logic View)

```mermaid
classDiagram
    %% Core Entities
    class Project {
        +String id
        +String name
        +List current_epic_ids
    }

    class Epic {
        +String id (uuid)
        +String project_id
        +String title
        +EpicStatus status
        +Priority priority
        +String thread_id (LangGraph)
        +Map context_snapshot
    }

    class Task {
        +String id (uuid)
        +String epic_id (Optional)
        +String project_id
        +String title
        +TaskStatus status
        +String assignee_id
    }

    class RoleReport {
        +String role_id
        +String summary
        +String status
        +List logs
    }

    class ChronicleEntry {
        +String id
        +String run_id
        +DateTime timestamp
        +String speaker_id
        +DialogueType type
        +String content
        +Map metadata (emotion, intent)
    }

    %% Enums
    class TaskStatus {
        <<enumeration>>
        INBOX
        BACKLOG
        PF, FBS, RFD, FBD, RFE_RFK
        FUE, RFQ, FUQ, RFT, FUT
        FL, FNL
    }

    class Priority {
        <<enumeration>>
        URGENT (Interrupt)
        HIGH
        NORMAL
        LOW
    }

    class DialogueType {
        <<enumeration>>
        CEO_COMMAND
        AGENT_DISCUSSION (🗣️)
        AGENT_RESPONSE (💬)
        INTENT (❗️)
        EMOTION (❤️)
    }

    Project "1" *-- "many" Epic : Contains
    Epic "1" *-- "many" Task : Contains (Optional)
    Task "1" *-- "many" RoleReport : Contains
```

### 2.2 Firestore Schema Definition

#### A. `/projects/{projectId}`
*   `name`: 프로젝트명
*   `current_epics`: 진행 중인 Epic ID 목록

#### B. `/epics/{epicId}`
*   `project_id`: 소속 프로젝트 ID
*   `title`: 에픽 명칭
*   `status`: 상태 (PLANNING, IN_PROGRESS, DONE, PAUSED)
*   `priority`: 우선순위 (**URGENT**, HIGH, NORMAL, LOW)
*   `thread_id`: LangGraph 상태 저장용 ID
*   `artifacts`: 산출물 링크 목록 (Git 경로 + 웹 URL)
*   `context_snapshot`: 장기 보존용 상태 스냅샷 (Resync 용)

#### C. `/tasks/{taskId}` (Work Queue Item)
*   `epic_id`: 소속 에픽 ID (**Optional** - 없으면 백로그)
*   `project_id`: 소속 프로젝트 ID
*   `title`: 작업명
*   `instruction`: 구체적 작업 지시
*   `status`: **INBOX**, **BACKLOG**, **PF**, ... (13공정)
*   `assignee`: 담당 가재 ID (`dev`, `po`...)

#### D. `/tasks/{taskId}/reports/{roleId}` (Role-Specific Memory)
*   `role_id`: `dev`, `ux` 등
*   `summary`: 해당 역할 관점의 요약 (기술적/디자인적 등)
*   `status`: DONE, IN_PROGRESS
*   `logs`: 해당 역할의 실행 로그 모음

#### E. `/chronicles/{runId}/entries/{entryId}` (Logs)
*   `speaker_id`: 발화자 (biseo, pm, dev...)
*   `type`: `AGENT_DISCUSSION`(🗣️), `AGENT_RESPONSE`(💬), `INTENT`(❗️), `EMOTION`(❤️)
*   `content`: 마크다운 내용
*   `metadata`: 상세 정보 (숨김 처리 가능)

---

## 3. 핵심 메커니즘 (Core Mechanisms)

### 3.1 비서가재 & 매니저가재 프로토콜 (The Executive Loop)
1.  **발화:** CEO "이거 하자" -> 비서가재가 `INBOX` 상태로 Task 생성.
2.  **분류 (Triage):** 기획가재(PO)가 `INBOX`를 주기적으로 검토하여 `Project/Epic` 분류.
3.  **계획 (Scheduling):** 매니저가재(PM)가 분류된 Task의 우선순위를 보고 `BACKLOG` -> `PF(착수)`로 상태 변경.
4.  **긴급 대응:** CEO가 "긴급!" 선언 시, 비서가재가 즉시 `URGENT Epic` 생성 후 매니저가재 호출 -> 강제 인터럽트 발동.

### 3.2 Action Planner Pattern (Orchestration)
*   **Engine (`gajae-os` CLI):** 상태 머신(LangGraph)을 돌리고 **`AgentAction` (JSON)**을 반환.
*   **Main Agent (`biseo`):** CLI의 출력을 파싱하여 **`openclaw.spawn(agentId)`**를 실제로 실행.
*   **Context Injection:** 깨울 때 해당 에이전트의 `RoleReport` (과거 요약)와 `Current Task Info`를 주입하여 실행.

### 3.3 13단계 공정 & 승인 게이트 (Approval Gate)

```mermaid
stateDiagram-v2
    [*] --> INBOX
    INBOX --> BACKLOG : Triage by PO
    BACKLOG --> PF : Scheduled by PM

    state "Planning Phase" as Planning {
        PF --> Discussion_PF
        state Discussion_PF {
             PO --> DEV : Feasibility Check
             DEV --> UX : Design Constraint
             UX --> PO : User Scenario
        }
        Discussion_PF --> FBD : Consensus Reached
        FBD --> RFE_RFK : Design Approved (CEO Gate)
    }

    state "Execution Phase" as Execution {
        RFE_RFK --> FUE : Eng Kick-off
        FUE --> RFQ : Implementation Done
        RFQ --> FUQ
        FUQ --> RFT : QA Passed (CEO Gate)
        RFT --> FUT : Staging Deploy
        FUT --> FL : Final Launch (CEO Gate)
    }
    
    FL --> [*]
```

### 3.4 토론 및 합의 프로토콜 (Discussion & Consensus Protocol)
가재들은 단순히 지시를 따르는 것이 아니라, 각자의 전문성을 바탕으로 치열하게 **토론(Discussion)**하고 **상호 검증(Critique)**합니다.

```mermaid
sequenceDiagram
    participant PM as 매니저가재
    participant PO as 기획가재
    participant DEV as 개발가재
    participant UX as 디자인가재
    participant DB as Firestore (Chronicle)

    PM->>PO: "로그인 기능 기획해" (Task Assign)
    PO->>DB: [Plan] "JWT 토큰 방식 로그인 기획서(Draft)"
    
    loop Discussion Loop (치열한 토론)
        PM->>DEV: "PO 기획서 기술 검토해" (Spawn Reviewer)
        DEV->>DB: [Critique] "보안상 Refresh Token 저장소 수정 필요함" (Reject)
        
        PM->>PO: "DEV 의견 반영해" (Spawn Author)
        PO->>DB: [Revise] "HttpOnly 쿠키 저장 방식으로 수정함" (Update)
        
        PM->>UX: "UX 검토해" (Spawn Reviewer)
        UX->>DB: [Critique] "로그인 실패 시 에러 메시지 너무 딱딱함" (Reject)
        
        PO->>DB: [Revise] "에러 메시지 톤앤매너 수정함" (Update)
    end
    
    PM->>PO: "더 이상 이견 없지?" (Check Consensus)
    PO-->>PM: "넵, 합의 완료되었습니다." (Consensus)
    PM->>DB: [State Transition] PF -> FBD
```

*   **Critique (비평):** 다음 단계로 넘어가기 전, 관련 전문가(Reviewer)가 반드시 결과물을 비평한다.
*   **Revise (수정):** 비평이 있으면 원작자(Author)는 결과물을 수정해야 한다.
*   **Consensus (합의):** 모든 Reviewer가 `APPROVE`를 낼 때까지 루프를 돈다.

### 3.5 뇌 부활 및 재동기화 (Resync Protocol)
*   **Sleep (동면):** Epic 종료/중단 시 `Summary` 작성 후 컨텍스트 삭제.
*   **Wake Up (1년 뒤):**
    1.  DB에서 `context_snapshot` 로드.
    2.  현재 파일 시스템과 비교(Diff).
    3.  변경된 환경에 맞춰 상태(State) 보정 후 재개.

### 3.6 아티팩트 관리 (Dual Storage)
*   **원본:** Git 저장소 (`docs/epics/...`)에 마크다운으로 저장.
*   **인덱스:** Firestore에 해당 파일의 링크 저장.
*   **보고:** 비서가재가 DB 조회 후 "여기 있습니다" 하고 링크 제공.

---

## 4. 구현 가이드 (Implementation Guide)

### 4.1 디렉토리 구조 (Canonical Directory)
```
docs/
├── epics/                  # 에픽별 산출물 아카이브
│   ├── E001-login/
│   │   ├── 1-plan/ (1pager.md)
│   │   ├── 2-design/ (gui.md)
│   │   └── 3-dev/ (api.md)
├── core/role/              # 가재별 역할 정의 (ROLE_DEV.md)
└── gajae-os/               # 시스템 코드 (TS - Orchestrator)
    ├── src/
    │   ├── agents/         # 에이전트 로직 (PO, PM, DEV...)
    │   ├── core/           # Firebase, OpenClawClient
    │   ├── graph/          # LangGraph Workflow
    │   └── types/          # TS Interfaces
    ├── .env                # (루트 참조)
    └── cli.ts              # CLI Entry Point
```

### 4.2 기술 스택
*   **Language:** TypeScript (Node.js)
*   **Orchestration:** LangGraph.js
*   **Storage:** Firestore (Data/Queue) + Local Git (Docs/Code)
*   **Runtime:** OpenClaw Multi-Agent System (11 Agents)

---

**[결론]**: 이 설계도는 **비서가재(Brain)**와 **가재 OS(Body)**가 결합된 완전 자율형 조직 시스템입니다. 🦞🚀