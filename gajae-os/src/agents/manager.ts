// ... (상단 Import 생략) ...
export class ManagerAgent {
  // ... (processTask 등 생략) ...

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      // 절대 경로 계산
      const scriptPath = `${process.cwd()}/src/scripts/log_chronicle.ts`;

      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Instruction] ${instruction}
        
        [IMPORTANT: Output Format]
        You MUST respond with a valid JSON object ONLY. No other text.
        
        {
          "thought": "Your internal reasoning process...",
          "emotion": "Current emotion (e.g. Confident, Worried)",
          "intent": "Intent of this response (e.g. REPORT_RESULT, ASK_QUESTION)",
          "response": "Final response content to be reported",
          "artifacts": [
             { "type": "1pager|code", "title": "Title", "content": "Full Content..." }
          ]
        }
      `;

      return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId: task.id });
  }

  // ... (logChronicle 생략) ...
}
