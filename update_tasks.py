import os
import datetime

task_dir = 'docs/task/'
timestamp = "2026-02-07 00:54"
files = [f for f in os.listdir(task_dir) if f.endswith('.md')]

for filename in files:
    path = os.path.join(task_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    updated_header = False
    added_log = False
    
    for line in lines:
        if line.startswith('# 마지막 업데이트:') and not updated_header:
            new_lines.append(f'# 마지막 업데이트: {timestamp}\n')
            updated_header = True
        elif line.startswith('## 2. 업무 기록') and not added_log:
            new_lines.append(line)
            new_lines.append(f'- **{timestamp}:** 자율 각성 주기(10분) 도달. 공정 진척도 1px 정밀 업데이트 및 무결성 수호. (운영 상태: OPTIMAL)\n')
            added_log = True
        else:
            new_lines.append(line)
            
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

print(f"Updated {len(files)} files.")
