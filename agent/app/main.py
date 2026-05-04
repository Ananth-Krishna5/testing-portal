import os
from typing import Any, Dict

import asyncpg
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Test Hub AI Agent", version="1.0.0")


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    context: Dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    reply: str


async def pg_counts() -> Dict[str, int]:
    url = os.getenv("DATABASE_URL", "")
    if not url:
        return {}
    try:
        conn = await asyncpg.connect(url)
        try:
            programs = await conn.fetchval("select count(*) from programs")
            projects = await conn.fetchval("select count(*) from projects")
            suites = await conn.fetchval('select count(*) from "test_suites"')
            fails = await conn.fetchval(
                'select count(*) from "test_results" where status = \'fail\''
            )
            return {
                "programs": int(programs or 0),
                "projects": int(projects or 0),
                "suites": int(suites or 0),
                "failed_tests": int(fails or 0),
            }
        finally:
            await conn.close()
    except Exception:
        return {}


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    counts = await pg_counts()
    base = (
        "You are TestHub's internal analytics copilot. Ground answers in the live counts below.\n"
        f"Counts: {counts}\n"
        f"User message: {body.message}\n"
    )
    api_key = os.getenv("LLM_API_KEY", "").strip()
    if not api_key:
        reply = (
            "Here is a grounded snapshot from the Test Hub database:\n"
            f"- Programs: {counts.get('programs', 'n/a')}\n"
            f"- Projects: {counts.get('projects', 'n/a')}\n"
            f"- Test suites (catalog): {counts.get('suites', 'n/a')}\n"
            f"- Failed test cases recorded: {counts.get('failed_tests', 'n/a')}\n\n"
            "Configure LLM_API_KEY on the AI agent service to enable full natural-language answers."
        )
        return ChatResponse(reply=reply)

    try:
        import httpx

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "Be concise. Prefer bullet points. Never invent counts; use provided numbers only."},
                {"role": "user", "content": base},
            ],
            "temperature": 0.2,
        }
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )
            r.raise_for_status()
            data = r.json()
            reply = data["choices"][0]["message"]["content"]
            return ChatResponse(reply=str(reply))
    except Exception as exc:
        return ChatResponse(reply=f"LLM call failed: {exc}. Counts: {counts}")
