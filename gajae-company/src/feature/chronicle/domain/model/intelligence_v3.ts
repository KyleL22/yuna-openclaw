/**
 * [가재 컴퍼니] Intelligence Unified Data Model (v3.0)
 * 의도: 11인 가재의 협업과 CEO의 명령을 정규화된 데이터 구조로 전환하여 '지능의 자산화'를 실현함.
 */

// 1. Fivefold Intelligence Protocol (개별 가재의 연산 단위)
export interface IntelligenceProtocol {
    authorId: string;      // 발신 가재 ID (DEV, PO, UX 등)
    authorName: string;    // 발신 가재 명칭
    intent: string;        // 1. 의도
    psychology: string;    // 2. 심리
    thought: string;       // 3. 생각
    action: string;        // 4. 행동
    response: {            // 5. 답변
        to: string;        // 수신 대상 (CEO, PM 등)
        message: string;   // 답변 내용
    };
}

// 2. Cross-domain Impact Assessment (교차 도메인 영향 분석)
export interface ImpactAssessment {
    domain: string;        // 대상 도메인 (DEV, QA, MARKETING 등)
    summary: string;       // 영향 요약
    load?: string;         // 공수/부하 (0.5MD 등)
}

// 3. Meeting Session (가재들의 협업 세션)
export interface MeetingSession {
    id: string;
    type: 'meeting' | 'report' | 'audit';
    topic: string;         // 미팅 주제
    date: string;          // YYYYMMDD
    time: string;          // HH:MM:SS
    participants: string[]; // 참석자 가재 ID 리스트
    activities: IntelligenceProtocol[]; // 실시간 카드 뷰 데이터
    impacts: ImpactAssessment[]; // 영향 분석 데이터
    finalDecision: string; // 최종 의사결정 사항
    status: 'open' | 'closed';
    createdAt: any;
}

// 4. CEO Command (대표님의 지지 및 집행)
export interface CEOCommand {
    id: string;
    type: 'command';
    title: string;
    date: string;
    time: string;
    instruction: string;   // 지엄한 지시 내용
    execution: IntelligenceProtocol; // 수행원(Attendant)의 집행 로그
    createdAt: any;
}
