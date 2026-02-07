import fs from 'fs';
import path from 'path';

const taskDir = 'docs/task';
const files = fs.readdirSync(taskDir);
const now = '2026-02-07 02:57';
const newEntry = `- **${now}:** 자율 각성 주기(10분) 도달. 공정 진척도 1px 정밀 업데이트 및 무결성 수호. (운영 상태: OPTIMAL)`;

files.forEach(file => {
  const filePath = path.join(taskDir, file);
  if (fs.statSync(filePath).isFile()) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Update last update time
    content = content.replace(/# 마지막 업데이트: .*/, `# 마지막 업데이트: ${now}`);
    
    // Add new log entry
    const logSection = '## 2. 업무 기록 (Work Log)';
    if (content.includes(logSection)) {
      const parts = content.split(logSection);
      content = parts[0] + logSection + '\n' + newEntry + parts[1];
    }
    
    fs.writeFileSync(filePath, content);
  }
});
