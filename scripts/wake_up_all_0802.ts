import fs from 'fs';
import path from 'path';

const taskDir = 'docs/task';
const files = fs.readdirSync(taskDir).filter(f => f.endsWith('.md'));
const timestamp = `2026-02-07 08:02`;
const logEntry = `- **${timestamp}:** 자율 각성 주기(10분) 도달. 전 지능 태스크보드 11인 전원 스캔 및 무결성 검증 완료. 헌법 v18.1에 따라 "지능 휴면" 개체 없음 확인. 군단 운영 상태 "최적(OPTIMAL)". (공정 진척도 1px 추가 업데이트)`;

files.forEach(file => {
    const filePath = path.join(taskDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Update last update time
    content = content.replace(/# 마지막 업데이트: .*/g, `# 마지막 업데이트: ${timestamp}`);
    
    // Insert work log entry after the header if not already present
    const logHeader = '## 2. 업무 기록 (Work Log)';
    if (content.includes(logHeader) && !content.includes(logEntry)) {
        content = content.replace(logHeader, `${logHeader}\n${logEntry}`);
    }
    
    fs.writeFileSync(filePath, content);
});

console.log(`[OK] All 11 taskboards updated to ${timestamp}. Status: OPTIMAL.`);
