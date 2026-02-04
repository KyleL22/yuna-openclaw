# 🦞 가재 컴퍼니 영구 불변 OS (yuna-openclaw)

> **"논리(Process)와 영혼(Persona)을 분리하여 가재의 지능을 영구히 박제한다."**

본 레포지토리는 가재 컴퍼니(Gajae Company)의 중앙 OS이며, 모든 프로젝트가 공유하는 **불변의 기반(Immutable Base)**입니다. 새로운 PC나 환경에서 본 OS만 복제(Clone)하면 즉시 가재 군단을 소환하고 프로젝트를 기동할 수 있습니다.

---

## 🏗️ 1. 표준 디렉토리 구조 (System Architecture)

가재 컴퍼니 워크스페이스는 다음과 같이 엄격하게 구조화됩니다.

```text
/workspace/
├── yuna-openclaw/           # [중앙 OS] 본 레포지토리 (영구 보존)
│   ├── rules_process/       # (Process) "어떻게 일하는가?" - 공정 및 SOP (Logic)
│   ├── rules_persona/       # (Persona) "어떤 마음가짐인가?" - 역할별 성격 및 규칙 (Soul)
│   ├── identities/          # (Identity) "누가 일하는가?" - 개체별 레벨 및 목표 (Employee)
│   ├── docs/templates/      # (Form) 산출물 표준 서식
│   └── scripts/             # (Automation) 운영 자동화 스크립트
└── {Project-Name}/          # [실전 프로젝트] (예: hello-bebe)
    ├── README.md            # 프로젝트 개요 및 기동 가이드
    ├── rules_process/       # [Sync] 중앙 OS로부터 복제된 공정 규율
    ├── rules_persona/       # [Sync] 중앙 OS로부터 복제된 역할 페르소나
    ├── hr/                  # [Sync] 중앙 OS로부터 복제된 개체별 자아 (identities)
    ├── docs/                # 프로젝트 고유 명세 (Product, Tech, QA 등)
    └── {Source-Code}/       # 실제 애플리케이션 소스 코드
```

---

## 🎭 2. 지능의 삼위일체 (Process, Persona, Identity)

본 OS는 가재의 지능을 세 가지 계층으로 완전히 분리하여 관리합니다.

### 📂 `rules_process/` (Rule Process: Logic)
작업의 **표준 절차(SOP)**만을 담고 있습니다. 프로젝트 도메인이 바뀌어도 변하지 않는 가재 컴퍼니의 '불변의 뇌'입니다.
- **`RULES_CONSTITUTION.md`**: 최상위 통합 헌법
- **`RULES_OPERATIONS.md`**: 12단계 표준 개발 프로세스
- **`RULES_COLLABORATION.md`**: 소통 및 보고 프로토콜

### 📂 `rules_persona/` (Rule Persona: Soul)
각 **역할(Role)**이 가져야 할 성격, 말투, 가치관, 그리고 역할 고유의 행동 규칙을 정의합니다.
- **`PO.md`**: 데이터 중심의 미니 CEO 자아 및 비즈니스 설계 규칙.
- **`DEV.md`**: 아키텍처에 집착하는 엔지니어 자아 및 구현 규칙.
- **`CS.md`**: 고객 감동을 실현하는 수호자 자아 및 대응 규칙.

### 📂 `identities/` (Identity: Employee Record)
실제 업무를 수행하는 **개체(Instance)**의 정보를 담습니다.
- **`po_lv1.md`**: 현재 Lv1인 PO 가재의 개인 목표와 성장 경로.
- **`dev_lv1.md`**: 현재 Lv1인 DEV 가재의 개인 목표와 성장 경로.

---

## 🚀 3. 새로운 환경에서의 기동 (Setup Guide)

새로운 PC나 환경에서 시스템을 재구축하는 순서입니다.

1. **중앙 OS 확보:** `git clone https://github.com/yuna-studio/yuna-openclaw.git`
2. **프로젝트 레포지토리 생성 및 이동:** `mkdir {Project-Name} && cd {Project-Name}`
3. **OS 규칙 이식 (Sync):** 
   - OS 레포의 `scripts/sync-constitution.sh`를 프로젝트 루트로 복사하여 실행합니다.
   - `sh sync-constitution.sh`를 통해 `rules_process/`, `rules_persona/`, `hr/`를 구축합니다.

---

## ⚖️ 4. 가재 구동 원칙 (The Driving Principle)
1. **자아 장착:** 모든 가재는 기동 시 자신의 `hr/` 파일을 로드하여 레벨과 목표를 인지한다.
2. **영혼 빙의:** 매핑된 `rules_persona/`를 통해 성격과 말투, 역할 규칙을 자신의 자아로 삼는다.
3. **공정 집행:** 장착된 자아를 가지고 `rules_process/`의 표준 공정을 1px의 오차 없이 집행한다.

**"지능은 논리로 무장하고, 가재는 영혼으로 움직인다."** 🦞⚖️📜
