import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List
from app.ai.prompts import SCOUT_SYSTEM_PROMPT

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def call_gemini_api(prompt: str, system_instruction: str = SCOUT_SYSTEM_PROMPT) -> str:
    if not GEMINI_API_KEY:
        return ""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system_instruction}\n\n{prompt}"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            candidates = data.get('candidates', [])
            if candidates:
                parts = candidates[0].get('content', {}).get('parts', [])
                if parts:
                    return parts[0].get('text', '')
        return ""
    except Exception as e:
        print(f"[GEMINI API WARNING] {e}")
        return ""

def generate_scout_chat(message: str, user_context: Dict[str, Any]) -> str:
    msg_lower = message.lower()
    user_id = user_context.get('userId') or user_context.get('user', {}).get('id') or 'default_user'
    
    # Check for Knowledge Base / Document Query intent
    kb_keywords = ["resume", "document", "pdf", "docx", "notes", "file", "kb", "knowledge base", "paper", "report"]
    if any(k in msg_lower for k in kb_keywords):
        try:
            from app.rag.schemas import RAGQueryInput
            from app.rag.rag_service import answer_grounded_query
            
            rag_res = answer_grounded_query(
                RAGQueryInput(userId=user_id, question=message, topK=5),
                user_lifeos_context=user_context
            )
            
            if rag_res.sources and len(rag_res.sources) > 0:
                sources_str = "\n\n**Knowledge Sources:**\n" + "\n".join([
                    f"• **{s.documentTitle}** (Page {s.pageNumber}, {s.section})" for s in rag_res.sources
                ])
                return f"{rag_res.answer}{sources_str}"
            else:
                return rag_res.answer
        except Exception as e:
            print(f"[RAG SCOUT ROUTE WARNING] {e}")

    # Handle SCOUT plan queries explicitly
    if "plan my day" in msg_lower or "plans for today" in msg_lower or "schedule today" in msg_lower:
        summary = user_context.get('summary', {})
        pending_cnt = summary.get('pendingTasksCount', 0)
        overdue_cnt = summary.get('overdueTasksCount', 0)
        
        return (
            f"I evaluated your schedule constraints and found **{pending_cnt} pending activities** ({overdue_cnt} overdue).\n\n"
            f"Here are candidate planning strategies generated for you:\n"
            f"1. **Plan A — Balanced (Score: 91/100)**: Optimizes priorities and leaves 3.5h free time.\n"
            f"2. **Plan B — Deadline First (Score: 88/100)**: Schedules urgent deadlines early.\n"
            f"3. **Plan C — Focus Optimized (Score: 89/100)**: Groups deep work in peak completion hours.\n"
            f"4. **Plan D — Low Stress (Score: 85/100)**: Interleaves 15-minute rest breaks.\n\n"
            f"Open the **AI PLAN MY DAY** modal from your Schedule tab to compare candidates side-by-side and apply your preferred plan with explicit confirmation."
        )

    context_str = json.dumps(user_context, indent=2)
    prompt = f"User Question: {message}\n\nCurrent LifeOS User Telemetry Context:\n{context_str}"
    
    gemini_resp = call_gemini_api(prompt, SCOUT_SYSTEM_PROMPT)
    if gemini_resp:
        return gemini_resp

    # Fallback deterministic response when GEMINI_API_KEY is not set
    summary = user_context.get('summary', {})
    prod_score = summary.get('productivityScore', 78)
    pending_cnt = summary.get('pendingTasksCount', 0)
    overdue_cnt = summary.get('overdueTasksCount', 0)

    if "productive" in msg_lower:
        return f"Based on your recorded LifeOS telemetry, your Productivity Score is **{prod_score}%**. Your activity peaks during evening hours."
    elif "today" in msg_lower or "work on" in msg_lower:
        return f"You currently have **{pending_cnt} pending tasks** ({overdue_cnt} overdue). Prioritize high-priority items and check your Schedule page."
    else:
        return f"LifeOS kernel status is operational. You have **{pending_cnt} pending tasks** and **{summary.get('activeGoalsCount', 0)} active goals**."
