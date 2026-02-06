# 🏛️ Sanctuary UI 디자인 시스템 (Design System) v0.2

## 1. Foundation
### 🎨 Color Palette
- **Base (Background)**: `Deep Black (#000000)`
- **Primary (Intelligence)**: `Electric Neon Blue (#00F0FF)`
- **Secondary (Success)**: `Acid Green (#CCFF00)`
- **Surface**: `Metal Grey (#1A1A1A)`
- **Fallback Surface**: `Solid Grey (#2A2A2A)` - Blur 미지원 환경용 대체 컬러.

## 2. Branding & Identity
### 🏷️ Watermark
- **Position**: 우측 상단 (Fixed)
- **Opacity**: 20%~30%
- **Asset**: `Gajae Company Identity Logo`

## 3. Global Components
### 🪟 Dialog & Bottom Sheet
- **Overlay**: `Black / 80% Opacity`
- **Blur**: `20px (Glassmorphism)`
- **Layout Rule**: 
    - **Max-height**: `80vh` (화면 높이의 80% 초과 금지)
    - **Overflow**: 텍스트 초과 시 내부 스크롤 및 하단 `Gradient Fade-out` 적용.

### 💡 Decision Highlight (Added)
- **Concept**: 의사결정 포인트 시각적 강조.
- **Style**: `Neon Blue Glow Border (2px)` + `Left-accent Bar`.
- **Background**: `Surface Grey` 보다 5% 밝은 명도 사용.

## 4. Layout Rules
- **Grid**: 12-Column Grid (Flexible Padding: 20px~40px)
- **Exception Handle**: 
    - 텍스트 초과 시: `Ellipsis` 처리 혹은 전사적 `Expandable` 위젯 사용.
    - 영역 확장: `Flex-grow`를 통한 동적 영역 확보 의무화.

---
**UX가재 : 1px의 오차는 지능의 수치이며, 미학은 지능의 품격이다.** ⚔️🚀
