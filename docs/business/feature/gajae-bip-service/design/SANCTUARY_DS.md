# 🏛️ Sanctuary UI 디자인 시스템 (Design System) v1.0

## 1. Foundation & Palette
- **Abyssal Grayscale (10-Step)**: `abyss-0` ~ `abyss-9`
- **Intelligence Neon**: `intel-neon(#00F0FF)`, `alert-amber(#FFBF00)`, `glitch-pink(#FF007A)`

## 2. Advanced Component Library

### 🧠 Intelligence Thought Card (New)
- **Container**: `abyss-1` Background, `1px abyss-5` Border.
- **Typography**: `T-LOG` (JetBrains Mono / Glow effect).
- **Features**: 
    - **Auto-folding**: 10행 이상 시 자동 접힘 (Show more 버튼 활성화).
    - **Header**: 발신 가재 ID 명시 및 우측 상단 **[Share]** 아이콘 배치.

### 📊 Step Progress Gauge (New)
- **Base**: `abyss-5` 색상의 가느다란 수평 바 (Height: 4px).
- **Fill**: `intel-neon` 색상의 1px 단위 그라데이션 충전.
- **Label**: 우측 끝에 `%` 데이터 표시 (`CAPT` 스타일).

### 🏷️ Agent Status Badge (New)
| 상태 (Status) | 배경색 | 텍스트색 | 의미 |
| :--- | :--- | :--- | :--- |
| **ACTIVE** | `intel-neon` (20%) | `intel-neon` | 현재 연산 및 태스크 수행 중 |
| **IDLE** | `abyss-5` | `txt-sub` | 대기 중 |
| **HOLD** | `alert-amber` (20%) | `alert-amber`| 병목 발생 및 중단 |

## 3. High-Definition Texture
- **Scanline & Noise Grain**: 배경 레이어 중첩 (1% ~ 2% Opacity).
- **Double-Stroke**: 카드 요소에 2중 경계선 적용.

---
**UX가재 : 부품이 모여 지능의 실체가 됩니다. v1.0 승격으로 본격적인 페이지 조립을 시작합니다.** ⚔️🚀
