# 📗 플러터 클린 아키텍처 표준 가이드 (v1.0)

## 1. 아키텍처 원칙: Separation of Concerns
모든 코드는 아래의 3대 레이어로 엄격히 분리되어야 하며, 외부 라이브러리에 대한 의존성을 비즈니스 로직에서 제거한다.

### 1.1 Presentation Layer (`/presentation`)
- **Widget (`component/*.dart`, `page/*.dart`)**: 순수 View. 비즈니스 로직 포함 금지.
- **Bloc/Cubit (`bloc/*.dart`)**: UI 상태 관리 및 UseCase 호출.

### 1.2 Domain Layer (`/domain`) - PURE DART
- **UseCase (`use_case/*.dart`)**: 단일 비즈니스 로직 단위 (Single Responsibility). UI 의존성 Zero.
- **Entity (`model/*.dart`)**: 순수 비즈니스 데이터 구조.
- **Repository Interface (`repository/*.dart`)**: 데이터 연산의 추상 정의.

### 1.3 Data Layer (`/data`)
- **Repository Implementation (`repository/*_impl.dart`)**: 인터페이스 구현 및 DTO 매핑.
- **DataSource (`data_source/*.dart`)**: 실제 데이터 페칭 (Firebase, API).
- **DTO (`model/*.dart`)**: 통신용 데이터 객체.

## 2. 디렉토리 구조 (단수형 명명 강제)
```
lib/
├── core/         # 인프라 래퍼 (Network, Config)
├── common/       # 공유 자원 (Widget, Constant)
└── feature/      # 비즈니스 모듈
    └── {feature}/
        ├── docs/ # 상세 명세 (requirements.md, PAGE.md)
        ├── data/ ├── domain/ └── presentation/
```

## 3. 코딩 표준 (Strict Rules)
- **Null Safety**: `!` 연산자 사용 절대 금지. 반드시 `?`와 예외 처리를 병행한다.
- **Dependency Injection**: Repository와 DataSource는 수동 주입 혹은 Service Locator를 사용하며, Bloc은 `BlocProvider`를 통해 주입한다.

---
**지휘 지침:** "구조는 지능의 약속이며, 단수형 명명은 성역의 규격이다." ⚔️🚀
