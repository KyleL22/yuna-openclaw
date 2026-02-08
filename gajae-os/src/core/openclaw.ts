import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 로드
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

/**
 * OpenClaw Gateway API Client
 * - 역할: Gateway와 통신하여 Agent를 Spawn하거나 메시지를 보냄.
 */
export class OpenClawClient {
  private readonly gatewayUrl: string;
  private readonly gatewayToken: string;

  constructor() {
    // Gateway URL (기본값: 로컬)
    this.gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
    
    // Gateway Token (필수)
    // 주의: .env에 OPENCLAW_GATEWAY_TOKEN이 있어야 함.
    this.gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || '';

    if (!this.gatewayToken) {
      console.warn('⚠️ [OpenClaw] Gateway Token이 설정되지 않았습니다. API 호출이 실패할 수 있습니다.');
    }
  }

  /**
   * Agent Spawn (세션 생성)
   * @param agentId 실행할 에이전트 ID (pm, po, dev...)
   * @param task 지시할 작업 내용
   * @param systemPrompt (선택) 시스템 프롬프트 오버라이드
   */
  async spawnAgent(agentId: string, task: string, systemPrompt?: string): Promise<string> {
    console.log(`🦞 [OpenClaw] Spawning Agent: ${agentId} -> "${task.slice(0, 30)}..."`);

    try {
      // Gateway API: POST /api/v1/sessions/spawn (가상의 엔드포인트 - 실제로는 Tool Call로 대체될 수 있음)
      // * 중요: gajae-os는 외부 프로세스이므로, HTTP API나 WebSocket으로 Gateway에 요청해야 함.
      // 하지만 현재 OpenClaw Gateway는 HTTP API 명세가 명확하지 않으므로,
      // 여기서는 "비서가재(Main Agent)가 Tool Call을 하는 것"을 시뮬레이션하거나
      // 실제 Gateway의 RPC 포트를 찔러야 함.
      
      // [임시 구현]
      // gajae-os가 "서버" 모드로 돌면서 Main Agent의 Tool Call을 받는 구조라면,
      // 반대로 gajae-os가 Main Agent에게 "얘 좀 실행해줘"라고 요청하는 건 불가능함.
      
      // [올바른 접근]
      // gajae-os 자체가 Main Agent에 의해 실행되는 "도구/로직"이라면,
      // Main Agent는 gajae-os의 리턴값을 보고 다음 행동(sessions_spawn)을 결정해야 함.
      
      // 따라서 여기서는 "실제 API 호출" 대신 "요청 객체 반환"만 하고,
      // Main Agent가 그걸 받아서 처리하는 게 맞음.
      
      return `Spawned session for ${agentId}`; // Mock Return

    } catch (error) {
      console.error(`❌ [OpenClaw] Spawn Failed:`, error);
      throw error;
    }
  }
}
