import os
import re

base_dir = "/Users/openclaw-kong/workspace/yuna-openclaw/docs/chronicle/daily/2026-02-06"
meeting_dir = os.path.join(base_dir, "meeting")
command_dir = os.path.join(base_dir, "command")

# Final stable slug map
final_map = {
    "성역 데이터 오염 사건 리뷰": "sanctuary_data_leak_review",
    "텔레그램 생각 노출 사고 대응": "telegram_thought_exposure_incident",
    "가재평의회 미팅거버넌스 설계": "crab_council_governance_design",
    "브랜드 디자인시스템 수립 세션": "branding_ds_initiation",
    "브랜드 디자인자산 법적 무결성 검토": "branding_legal_integrity_review",
    "제1차 정기 공정 싱크 미팅": "1st_regular_sync_meeting",
    "인사평가 및 PM 거버넌스 시스템 설계": "hr_pm_governance_design",
    "등급제 폐기 및 MVP 전략 피벗 세션": "grading_system_removal_pivot",
    "성역 데이터 오염 재발 공동 리뷰": "sanctuary_data_leak_recurrence_review",
    "하이엔드 벤치마킹 영감 세션": "high_end_benchmarking_session",
    "미학적 심연 재건축 세션": "ds_abyssal_depth_reconstruction",
    "Sanctuary UI 공용 컴포넌트 정밀 설계": "sanctuary_ui_component_design",
    "공용 UI 컴포넌트 확장 및 시각화 설계": "ui_component_expansion_design",
    "Service-MVP v1.7 최종 디자인 리뷰": "final_design_review_v1_7",
    "초정밀 UIUX 명세 및 페이지플로우 최종 검수": "uiux_spec_final_inspection",
    "비즈니스-마케팅-디자인 전략적 통합 얼라인": "strategic_alignment_po_marketing_ux",
    "지능 데이터 계층 시각화 전략 세션": "data_hierarchy_visualization_strategy",
    "UI 파싱을 위한 룰베이스 기록 표준화": "parsable_writing_standard",
    "개발 이관을 위한 UIUX 최종 기술 가이드 검수": "technical_handover_guide_review",
    "UI 카피라이팅 및 법적 문구 무결성 검수": "ui_copy_legal_review",
    "웹 서비스 최적화 및 브라우저 경험 BX 수립": "web_service_bx_optimization",
    "Service-MVP v1.7 개발 공정 킥오프": "engineering_kickoff_v1_7",
    "계층적 디렉토리 기반 데이터 페칭 전략 얼라인": "hierarchical_data_fetching_alignment",
    "성역 자산 총망라 및 세계관 노출 구조 설계": "sanctuary_asset_disclosure_architecture",
    "계층적 디렉토리 렌더링 무결성 및 구현 가능성 최종 검토": "directory_rendering_feasibility_review",
    "연대기 3대 계층 구조화 및 커맨드 폴더 신설": "triple_layer_archive_structure",
    "지능 자율 각성 및 정기 싱크 크론 설정": "autonomous_wakeup_sync_cron"
}

def finalize_filenames(directory):
    for f in os.listdir(directory):
        if not f.endswith(".md"): continue
        # Identify files with Korean characters
        if any(ord(c) > 127 for c in f):
            match = re.search(r'^(\d{8}_\d{4})_(.*)\.md$', f)
            if match:
                ts = match.group(1)
                kor = match.group(2).replace("_", " ")
                slug = final_map.get(kor, kor.lower().replace(" ", "_"))
                new_f = f"{ts}_{slug}.md"
                os.rename(os.path.join(directory, f), os.path.join(directory, new_f))
                print(f"Final Fix: {f} -> {new_f}")

finalize_filenames(meeting_dir)
finalize_filenames(command_dir)
