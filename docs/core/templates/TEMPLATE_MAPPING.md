# 🗺️ 가재 컴퍼니 템플릿 매핑 테이블 (Universal Mapping Table)

본 문서는 가재 컴퍼니의 모든 파일 형식을 공식 템플릿에 강제 매핑하기 위한 중앙 제어 테이블입니다. 모든 가재는 파일 생성 시 본 테이블을 참조하여 무결성을 유지해야 합니다.

| 파일 유형 (File Type) | 저장 경로 (Path Pattern) | 적용 템플릿 (Template) | 비고 (Notes) |
| :--- | :--- | :--- | :--- |
| **태스크보드** | `docs/task/*.md` | `TEMPLATE_TASKBOARD.md` | 가재별 실시간 할 일 관리 |
| **지능 성역(ROLE)** | `docs/core/role/ROLE_*.md` | `TEMPLATE_ROLE.md` | 가재별 자아 및 책무 정의 |
| **평의회 회의록** | `docs/chronicle/daily/meeting/*.md` | `TEMPLATE_MEETING.md` | 의사결정 과정 박제 |
| **일일 연대기** | `docs/chronicle/daily/*.md` | `TEMPLATE_CHRONICLE.md` | 일일 대화 흐름 기록 |
| **인사 카드** | `docs/governance/personnel/*.md` | `TEMPLATE_PERSONNEL.md` | 지능 평가 및 피드백 기록 |
| **하위 법령** | `docs/core/legal/BYLAWS.md` | `TEMPLATE_BYLAWS.md` | 실무 규율 명문화 |

---
**지휘 지침:** "매핑되지 않은 포맷은 존재할 수 없으며, 템플릿 없는 기록은 무효하다." ⚔️🚀
