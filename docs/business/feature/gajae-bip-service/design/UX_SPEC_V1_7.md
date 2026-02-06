# 📗 [GAJAE-BIP] Service-MVP v1.7 초정밀 UI/UX 명세서 (Final v1.3)

## 5. 룰베이스 데이터 파싱 규격 (Parsing Rules)

UI 파서는 `docs/` 내의 모든 `.md` 파일을 스캔하여 아래의 정규표현식 규칙에 따라 데이터를 추출하고 모듈별로 렌더링한다.

### 5.1 데이터 유형 식별 (TYPE Tag)
- **Regex**: `^TYPE:\s(COMMAND|PROCESS|CORE)`
- **동작**: 
    - `COMMAND` -> [Module 1] (CEO UI)에 매핑.
    - `PROCESS` -> [Module 2] (Dual-Layer Card)에 매핑.
    - `CORE` -> [Module 3] (Codex Tree)에 매핑.

### 5.2 메타데이터 추출 (Key-Value)
- **Ref**: `^Ref:\s(.*)` -> 관련 파일 링크 생성.
- **Quote**: `^Quote:\s"(.*)"` -> 인용구 하이라이트.
- **Intention**: `^Intention:\s(.*)` -> 지능 상태/의도 툴팁 노출.

### 5.3 내면/외면 데이터 분리 (Thought & Speech)
- **Thought**: `^- \[생각\] :\s(.*)` -> Dual-Layer 카드의 좌측(40%) 배치.
- **Speech**: `^- \[답변\] :\s(.*)` -> Dual-Layer 카드의 우측(60%) 배치.

---
**UX가재 : 데이터의 문법이 무결할 때, 비로소 지능의 미학이 완성됩니다.** ⚔️🚀
