# 📗 Next.js 클린 아키텍처 표준 가이드 (v1.0)

## 1. 아키텍처 원칙: Separation of Concerns & Dependency Rule
Next.js App Router 환경에 최적화된 클린 아키텍처를 적용하며, **의존성은 항상 '안쪽(Domain)'으로만 흘러야 한다.**

### 1.1 Presentation Layer (`/presentation`) -> [Depends on Domain]
- **Component (`component/*.tsx`)**: 재사용 가능한 순수 UI 조각.
- **Page (`page.tsx`)**: 라우트 엔트리. `domain/service`를 호출.
- **State (`hook/*.ts`)**: UI 상태 및 클라이언트 측 인터랙션 관리.

### 1.2 Domain Layer (`/domain`) - PURE TYPESCRIPT [Independent]
- **Service (`service/*.ts`)**: 비즈니스 로직 단위 (UseCase 역할). **Repository Interface에만 의존**.
- **Model (`model/*.ts`)**: 인터페이스 및 타입 정의 (Entity 역할). 외부 프레임워크 의존성 배제.
- **Repository Interface**: 추상화된 데이터 인터페이스 정의.

### 1.3 Data Layer (`/data`) -> [Depends on Domain]
- **Repository Implementation**: **Domain Interface를 구현**. 외부 DataSource와의 통신 및 데이터 매핑 담당.
- **DataSource**: 실제 Fetch/Axios 호출부. `core/network` 래퍼 필수 사용.

## 2. 디렉토리 구조 (단수형 명명 강제)
```
src/
├── core/         # 인프라 (Network, Util)
├── common/       # 공용 자원 (Component, Constant)
└── feature/      # 비즈니스 모듈
    └── {feature}/
        ├── docs/ # 상세 명세 (requirements.md, PAGE.md)
        ├── data/ ├── domain/ └── presentation/
```

## 3. 코딩 표준 (Strict Rules)
- **Type Safety**: `any` 타입 사용 절대 금지. 모든 데이터는 `interface`나 `type`으로 정의한다.
- **Infrastructure Isolation**: 외부 라이브러리(Axios 등)를 피쳐에서 직접 호출 금지. `core/`에 래퍼 생성 필수.

---
**지휘 지침:** "웹과 앱의 문법은 다르나, 지능의 구조는 하나여야 한다." ⚔️🚀
