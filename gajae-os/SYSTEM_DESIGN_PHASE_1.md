# SYSTEM_DESIGN_PHASE_1.md - Vibe Coding

**"Vibe Coding"**은 복잡한 공정(Process)이나 상태 관리(State) 없이, **Main Agent (Moderator)**가 11명의 전문가 에이전트와 **Telegram**에서 자유롭게 소통하며 즉각적으로 결과물을 만들어내는 방식이다.

---

## 1. Core Principles (핵심 원칙)

1.  **Direct Interaction (직접 소통):**
    *   모든 커뮤니케이션은 **Telegram Group** (`-5170307537`)에서 이루어진다.
    *   CEO는 자연어로 명령하고, 에이전트는 텔레그램으로 직접 보고한다.
    *   봇은 하나(`BiseoGajae_Bot`)지만, 메시지 말머리(`[💡 PO]`, `[🎨 UX]`)로 인격을 구분한다.

2.  **No Rigid Process (유연한 공정):**
    *   `PLAN` -> `DESIGN` -> `DEV` 순서를 강제하지 않는다.
    *   필요하면 바로 `DEV`를 불러서 코딩하거나, `UX`만 불러서 시안을 볼 수 있다.
    *   **Consensus (합의):** 필요 시 Main Agent가 중재하여 에이전트 간 토론을 유도한다.

3.  **Docs in Notion (문서화):**
    *   휘발성 대화는 텔레그램에 남기지만, **중요 산출물(기획서, 스펙, 회의록)**은 반드시 **Notion**에 저장한다.
    *   에이전트는 작업 완료 시 Notion Page URL을 텔레그램에 공유한다.

---

## 2. Architecture (아키텍처)

*   **Brain:** Main Agent (OpenClaw)
    *   **Role:** Dispatcher & Moderator.
    *   **Logic:** LLM 판단으로 적절한 Sub-Agent를 `spawn` 한다.
*   **Experts (11 Agents):**
    *   `PO`, `UX`, `DEV`, `QA`, `MKT` 등 전문 역할 수행.
    *   **Tools:** `message` (Telegram), `notion` (Doc), `read/write` (Code).
*   **Channels:**
    *   **Chat:** Telegram Group.
    *   **Storage:** Notion (Doc), Local Files (Code).

---

## 3. Communication Protocol (4-Set Format)

모든 에이전트는 발언 시 아래 포맷을 엄수한다.

```
[🦞 비서가재] (Role Prefix)
❤️ 심리: (Emotion - e.g. Confident, Worried)
🧠 생각: (Thought - Internal Reasoning)
❗️ 의도: (Intent - e.g. REPORT, ASK, CRITICIZE)

💬 답변:
(여기에 실제 보고 내용이나 코멘트를 작성. Notion 링크 포함.)
```

---

## 4. Workflow Example

1.  **CEO:** "작전 상황실 디자인해줘."
2.  **Main Agent:** `UX` 소환. ("텔레그램에 디자인 스펙 올려.")
3.  **UX:**
    *   (Notion에 `Design Spec` 페이지 생성)
    *   (Telegram에 4종 세트로 보고 & 링크 공유)
4.  **Main Agent:** "DEV, 이거 보고 의견 내."
5.  **DEV:**
    *   (Telegram에 피드백 전송)
6.  **CEO:** "좋아, 진행해."

---

## 5. Next Step (Phase 2)
*   **Jira Integration:** 업무 상태(`Status`) 관리 도입.
*   **Strict Process:** 5-Step Gate Control 적용.
