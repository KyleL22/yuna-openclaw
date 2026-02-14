#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/gajae-company" && pwd)"

cd "$PROJECT_DIR"

if [ ! -d "node_modules" ]; then
  echo "[openclaw] node_modules missing, running npm install..."
  npm install
fi

# Start Next dev server
npm run dev &
SERVE_PID=$!

trap 'kill $SERVE_PID 2>/dev/null || true' EXIT

echo "[openclaw] 가재컴퍼니 서버가 시작되었습니다. http://localhost:3000"
echo "[openclaw] 종료하려면 Ctrl+C 를 누르세요."

wait "$SERVE_PID"
