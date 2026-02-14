# Vibe Log Server (Interceptor)

MITM Proxy를 사용하여 LLM API 트래픽을 가로채고(Log), SQLite DB에 저장하는 도구입니다.
"바이브 코딩"의 모든 과정(생각, 답변, 프롬프트)을 기록하기 위해 사용합니다.

## 설치 (Installation)

```bash
pip install -r requirements.txt
```

## 실행 (Run)

```bash
mitmdump -s interceptor.py
```

## 프록시 설정 (Proxy Setup)

타겟 애플리케이션(Antigravity, Cursor 등)의 프록시 설정을 `http://127.0.0.1:8080`으로 변경하세요.
HTTPS 복호화를 위해 `mitmproxy-ca-cert.pem` 인증서 설치가 필요할 수 있습니다.
