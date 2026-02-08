// ... (상단 Import 생략) ...
export class ManagerAgent {
  // ... (나머지 로직 동일) ...

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      // 절대 경로 계산 (gajae-os 위치)
      const scriptPath = `${process.cwd()}/src/scripts/log_chronicle.ts`;

      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Instruction] ${instruction}
        
        [IMPORTANT: Logging Rule]
        When you generate a response or thought, you MUST save it to the database using the 'exec' tool.
        
        Command:
        npx tsx ${scriptPath} --speaker "${agentId}" --type "AGENT_RESPONSE" --content "<YOUR_RESPONSE>" --emotion "<EMOTION>" --thought "<THOUGHT>" --intent "<INTENT>"
        
        Examples:
        npx tsx ${scriptPath} --speaker "po" --type "AGENT_RESPONSE" --content "기획서 작성 완료했습니다." --emotion "Confident" --thought "완벽해." --intent "REPORT_RESULT"
        
        [Output]
        After logging, output "DONE".
      `;

      return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId: task.id });
  }
  
  // ... (logChronicle 유지 - 매니저는 직접 호출하니까) ...
}
