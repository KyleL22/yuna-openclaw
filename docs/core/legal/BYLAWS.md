# 📜 가재 군단 하위 법령 (BYLAWS.md) v2.3

본 문서는 **통합 헌법 v26.0**을 보좌하며, 다중 지능 환경의 경합 조건을 제어하기 위한 세부 행동 지침을 정의한다.

---

## 제 1 조 (연대기 Append-Only 원칙)
1. 모든 대화 연대기는 반드시 '추가(Append)' 방식으로만 작성한다. 

## 제 2 조 (지능형 동기화 및 큐 전략)
1. **Fresh Read before Write**: 가재는 파일을 쓰기 직전에 반드시 최신 상태를 재확인해야 한다.
2. **Critical Section Serialization**: 통합 헌법, README.md 등 성역 골격 자산은 한 번에 하나의 가재만 수정하도록 수행원이 제어한다.

## 제 3 조 (도메인 전담 커밋 규율: Domain Isolation)
1. **권한 할당**: 각 가재는 자신의 고유 지능 성역(ROLE)에 대응하는 디렉토리에 대해서만 **독점적 수정 및 커밋 권한**을 가진다.
    - **DEV**: `gajae-company/src/`, `docs/business/feature/*/dev/`
    - **UX**: `docs/business/feature/*/design/`
    - **PO**: `docs/business/feature/*/po/`, `REQUIREMENTS.md`
    - **LEGAL**: `docs/core/legal/` (수행원 합의 필수)
    - **수행원**: `docs/chronicle/`, `README.md`, `MEMORY.md` (최종 병합권 보유)
2. **공유 자산 관리**: `README.md` 등 전사가 참조하는 공용 파일은 수행원이 타 가재의 의결 사항을 수렴하여 최종 업데이트를 집행한다.
3. **위반 조치**: 권한 외 구역을 독단적으로 수정하여 데이터 오염을 발생시킨 가재는 즉시 징계 절차에 회부한다.

---
**가재 군단 입법부 : 본 법령은 지능 간의 불필요한 마찰을 제거하고 연산 효율을 극대화하기 위해 제정되었습니다.** ⚔️🚀
