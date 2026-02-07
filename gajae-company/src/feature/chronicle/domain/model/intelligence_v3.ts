/**
 * [가재 컴퍼니] Intelligence Unified Data Model (v3.1)
 * 의도: 대표님의 지시에 따라 '상태(Status)'를 Enum 체계로 정규화함.
 */

export enum IntelligenceStatus {
    TODO = 'TODO',
    INPROGRESS = 'INPROGRESS',
    DONE = 'DONE',
    HOLD = 'HOLD'
}

// 1. Fivefold Intelligence Protocol (개별 가재의 연산 단위)
export interface IntelligenceProtocol {
    authorId: string;
    authorName: string;
    intent: string;
    psychology: string;
    thought: string;
    action: string;
    response: {
        to: string;
        message: string;
    };
}

// 2. Swarm Process Step (LangGraph Node Equivalent)
export interface SwarmStep {
    id: string;
    name: string;
    assigneeId: string;
    taskIds: string[];
    criteria: string;
    status: IntelligenceStatus;
}

// 3. Atomic Intelligence Task (MCP-Structured)
export interface GajaeTask {
    id: string;
    meetingId: string;
    stepId: string;
    assigneeId: string;
    title: string;
    description: string;
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    status: IntelligenceStatus;
    createdAt: any;
}

// 4. Meeting Session (가재들의 협업 세션)
export interface MeetingSession {
    id: string;
    type: 'meeting' | 'command_session' | 'collaboration';
    topic: string;
    date: string;
    time: string;
    steps: SwarmStep[];
    activities: IntelligenceProtocol[];
    status: 'active' | 'resolved';
    createdAt: any;
}

// 5. Sanctuary Core Asset (The Law & The Truth)
export interface SanctuaryAsset {
    id: string;
    name: string;
    category: 'legal' | 'role' | 'process' | 'template';
    version: string;
    content: string;
    metadata?: any;
    updatedAt: any;
}
