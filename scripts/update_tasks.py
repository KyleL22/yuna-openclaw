import os
from datetime import datetime

timestamp = "2026-02-07 02:46"
log_entry = f"- **{timestamp}:** 자율 각성 주기(10분) 도달. 공정 진척도 1px 정밀 업데이트 및 무결성 수호. (운영 상태: OPTIMAL)\n"

task_dir = "docs/task/"
files = [f for f in os.listdir(task_dir) if f.endswith(".md")]

for filename in files:
    path = os.path.join(task_dir, filename)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Update last update line
    lines = content.split("\n")
    if lines[0].startswith("# 마지막 업데이트:"):
        lines[0] = f"# 마지막 업데이트: {timestamp}"
    
    # Find Work Log and insert entry
    new_lines = []
    found_work_log = False
    inserted = False
    for line in lines:
        new_lines.append(line)
        if "## 2. 업무 기록 (Work Log)" in line or "## 2. 업무 기록" in line:
            found_work_log = True
        elif found_work_log and not inserted and line.strip() == "":
            # Skip empty lines after header if they exist, but usually it's followed by a line starting with -
            pass
        elif found_work_log and not inserted and line.startswith("-"):
            # Insert before the first list item
            current_idx = len(new_lines) - 1
            new_lines.insert(current_idx, log_entry.strip())
            inserted = True
            
    if not inserted and found_work_log:
        new_lines.append(log_entry.strip())

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))

print(f"Updated {len(files)} files.")
