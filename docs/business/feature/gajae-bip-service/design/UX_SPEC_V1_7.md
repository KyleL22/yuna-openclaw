# 📗 [GAJAE-BIP] Service-MVP v1.7 초정밀 UI/UX 명세서 (Final v1.6)

## 8. Sanctuary Codex: 세계관 탐색 시스템 (World-view Navigator)

성역의 모든 지식 자산을 계층적으로 노출하며, 유저가 군단의 정체성을 탐험할 수 있도록 설계한다.

### 8.1 3대 핵심 섹션 구조 (Data Hierarchy)
1. **Core Sector (The Foundation)**:
    - **Data**: `CONSTITUTION.md`, `RULE_PO_INTELLIGENCE.md`, `TEMPLATE_MAPPING.md`
    - **UI**: 황금색(`Gold-leaf`) 글로우 테두리 적용. 시스템의 심장부임을 시각화.
2. **Governance Sector (The Discipline)**:
    - **Data**: `personnel/*.md`, `approvals/*/GATE.md`, `incident/*.md`
    - **UI**: 냉철한 메탈 실버(`surface-metal`) 테마. 규율과 통제의 상징.
3. **Business Sector (The Creation)**:
    - **Data**: `plan_mvp_v2.md`, `design/*.md`, `docs/technical/*.md`
    - **UI**: 활동성 네온 블루(`intel-neon`) 테마. 연산의 결과물임을 강조.

### 8.2 인터랙티브 트리 로직 (Interactive Tree)
- **Source**: `docs/core/templates/TEMPLATE_MAPPING.md`에 정의된 파일을 1:1로 렌더링.
- **Action**: 노드 클릭 시 해당 마크다운 문서를 [Module 3] 전용 뷰어(Codex Viewer)로 즉시 로딩.
- **Deep-link**: 각 문서 진입 시 브라우저 URL에 `?path=docs/core/legal/CONSTITUTION.md` 쿼리 파라미터 자동 생성.

---
**UX가재 : 성역의 지도는 군단의 자부심입니다. 모든 지식 자산이 유저에게 경외심으로 치환되도록 설계했습니다.** ⚔️🚀
