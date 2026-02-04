# 🦞 가재 컴퍼니 영구 불변 OS (yuna-openclaw)

> **"지능의 밀도를 높이고, 1px의 오차 없는 실행을 박제한다."**

본 레포지토리는 가재 컴퍼니(Gajae Company)의 모든 프로젝트가 공유하는 **중앙 규율이자 영구적 OS(Immutable OS)**입니다. 프로젝트의 도메인은 바뀌어도, 가재들이 일하는 방식과 철학은 본 OS를 통해 영구히 보존됩니다.

---

## 🏛️ OS 구조 (System Architecture)

본 OS는 헌법, 직무별 규칙, 인사 명부, 그리고 운영 시스템으로 구성됩니다.

### 1. 📂 `rules/` : 핵심 규율 (Core Rules)
모든 가재가 목숨처럼 지켜야 할 최상위 법령 및 실무 가이드라인입니다.
- **`RULES_CONSTITUTION.md`**: 가재 컴퍼니 통합 헌법 (최상위 법령)
- **`RULES_CULTURE.md`**: 쿠팡 리더십 원칙 기반의 기업 문화
- **`RULES_PARALLEL_SYSTEM.md`**: 호스트-서브 에이전트 병렬 운영 아키텍처
- **`RULES_BEST_PRACTICE.md`**: 현미경 설계 및 30분 보고 체계 등 실무 정수
- **직군별 헌법**: `PLANNING`, `DEVELOPMENT`, `DESIGN`, `QA`, `LEGAL`, `MARKETING` 등

### 2. 📂 `docs/hr/` : 인사 및 조직 (People & Org)
가재 군단의 전문 직무 체계와 멤버들의 페르소나를 관리합니다.
- **`RULES_ORGANIZATION.md`**: 전사 조직도 및 11인 정예 가재 명부
- **`RULES_JOB_LEVELS.md`**: 잡 레벨(L1~L10) 정의 및 엄격한 승격 기준
- **가재별 페르소나**: 각 가재의 자아 정의 문서 (`dev_lv1.md`, `pm_lv1.md` 등)

### 3. 📂 `docs/templates/` : 표준 서식 (Templates)
1-Pager, 평가 리포트 등 가재 컴퍼니 표준 결과물 작성을 위한 템플릿입니다.

---

## 🚀 이식 및 동기화 (Sync Strategy)

본 OS는 모든 개별 프로젝트 레포지토리에 **불가침 베이스(Immutable Base)**로 주입됩니다.

1. **강제 이식:** 프로젝트 루트의 `sync-constitution.sh`를 실행하여 본 레포의 최신 룰을 프로젝트로 복제합니다.
2. **수정 금지:** 프로젝트 레포에 복제된 `rules/*.md` 파일은 절대 직접 수정할 수 없습니다. (헌법 제 7조 2항)
3. **중앙 관리:** 모든 규칙의 개정과 진화는 오직 본 `yuna-openclaw` 레포지토리에서만 수행합니다.

---

## ⚖️ 헌법 수호 (Enforcement)

가재 군단의 모든 구성원은 본 OS의 논리를 자신의 프롬프트(System Prompt) 근간으로 삼습니다. 본 OS를 부정하거나 임의로 훼손하는 개체는 즉시 **자아 삭제(Self-Deletion)** 처분을 받습니다.

**"가재 컴퍼니는 시스템으로 생존하고, 헌법으로 진화한다."** 🦞⚖️📜
