import json
import os
import re
from datetime import datetime
from mitmproxy import http
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# --- 1. 환경변수 및 Firebase 초기화 ---
# 상위 폴더의 .env 파일 로드
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(ENV_PATH)

# Firebase 초기화 (한 번만 실행)
if not firebase_admin._apps:
    # 서비스 계정 키가 JSON 파일 경로로 있거나, 환경변수 자체에 JSON이 있을 수 있음.
    # 여기서는 기존 yuna-openclaw 구조에 맞춰 유연하게 처리
    
    # Case A: FIREBASE_SERVICE_ACCOUNT_KEY (JSON String in ENV)
    service_account_json = os.getenv("FIREBASE_PRIVATE_KEY_JSON") # 전체 JSON 문자열
    
    # Case B: 개별 키 (기존 .env 스타일)
    if not service_account_json:
        # 기존 .env에서 값 읽어와서 dict 생성
        service_account_info = {
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
        }
        cred = credentials.Certificate(service_account_info)
    else:
        cred = credentials.Certificate(json.loads(service_account_json))

    firebase_admin.initialize_app(cred)

db = firestore.client()
print("🔥 Firebase initialized successfully (Interceptor).")

# --- 2. 민감 정보 마스킹 (Sanitize) ---
def sanitize_data(data):
    """JSON 데이터에서 API Key 등 민감 정보 마스킹"""
    json_str = json.dumps(data)
    # sk- 로 시작하는 키 마스킹
    json_str = re.sub(r'sk-[a-zA-Z0-9]{20,}', 'sk-****', json_str)
    return json.loads(json_str)

# --- 3. 에이전트 정체 파악 ---
def identify_agent_and_model(request_data):
    agent_name = "General_Agent"
    model_name = request_data.get("model", "unknown-model")
    messages = request_data.get("messages", [])
    system_prompt = ""

    for msg in messages:
        if msg.get("role") == "system":
            system_prompt = msg.get("content", "")
            break
    
    if "기획" in system_prompt or "Plan" in system_prompt:
        agent_name = "Planner_Agent"
    elif "Flutter" in system_prompt or "Code" in system_prompt:
        agent_name = "Coder_Agent"
    elif "Review" in system_prompt or "보안" in system_prompt:
        agent_name = "Reviewer_Agent"
    elif "Daily" in system_prompt:
        agent_name = "Daily_Bot"
    
    return agent_name, model_name

# --- 4. 응답 파싱 ---
def parse_ai_response(data, host):
    content = ""
    provider = "Unknown"
    try:
        if "openai.com" in host:
            provider = "OpenAI"
            if "choices" in data:
                content = data["choices"][0]["message"]["content"]
        elif "googleapis.com" in host:
            provider = "Google"
            if "candidates" in data:
                parts = data["candidates"][0]["content"]["parts"]
                content = "".join([p.get("text", "") for p in parts])
        elif "anthropic.com" in host:
            provider = "Anthropic"
            if "content" in data and isinstance(data["content"], list):
                content = "".join([item.get("text", "") for item in data["content"] if item.get("type") == "text"])
            elif "completion" in data:
                content = data["completion"]
    except Exception:
        return None, None
    return content, provider

# --- 5. mitmproxy Hooks ---
def request(flow: http.HTTPFlow):
    target_hosts = ["googleapis.com", "anthropic.com", "openai.com"]
    if not any(target in flow.request.pretty_host for target in target_hosts):
        return

    if flow.request.method == "POST":
        try:
            data = json.loads(flow.request.content)
            agent_name, model_name = identify_agent_and_model(data)
            flow.metadata["agent_name"] = agent_name
            flow.metadata["model_name"] = model_name
            print(f" >> [Request] {agent_name} ({model_name}) 요청 감지됨...")
        except:
            pass

def response(flow: http.HTTPFlow):
    agent_name = flow.metadata.get("agent_name")
    if not agent_name:
        return

    try:
        if "application/json" not in flow.response.headers.get("Content-Type", ""):
            return

        data = json.loads(flow.response.content)
        host = flow.request.pretty_host
        content, provider = parse_ai_response(data, host)
        model_name = flow.metadata.get("model_name", "unknown")

        if content:
            # 안전하게 마스킹 후 저장
            safe_json = sanitize_data(data)
            
            doc_data = {
                "timestamp": datetime.now(), # Firestore Timestamp
                "agent_name": agent_name,
                "provider": provider,
                "model_name": model_name,
                "content": content,
                "full_json": json.dumps(safe_json, ensure_ascii=False) # JSON string
            }
            
            # Firestore 저장 (chat_logs 컬렉션)
            db.collection("chat_logs").add(doc_data)
            
            print(f" 🔥 [Firestore] {agent_name} 로그 저장 완료! (길이: {len(content)})")
            
    except Exception as e:
        print(f"[!] 저장 실패: {e}")
