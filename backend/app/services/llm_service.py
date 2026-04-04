from openai import OpenAI
import anthropic
import google.generativeai as genai


def _build_prompts(
    from_address: str,
    to_address: str | None,
    subject: str,
    body_text: str,
    user_name: str | None = None,
    rag_context: list[dict] | None = None,
) -> tuple[str, str]:
    """Build system and user prompts shared across all providers."""
    system_prompt = (
        "You are an AI email assistant. Your job is to draft professional, "
        "concise, and helpful email replies. Match the tone of the original "
        "email — if it's casual, reply casually; if it's formal, reply formally. "
        "Do NOT include a subject line. Write only the reply body. "
        "Do NOT include placeholder text like [Your Name] — if you don't know "
        "something, leave it out."
    )
    if user_name:
        system_prompt += f"\n\nThe user's name is {user_name}."

    if rag_context:
        context_text = "\n\n---\n\n".join(
            f"**{item['title']}**\n{item['content']}" for item in rag_context
        )
        system_prompt += (
            "\n\nUse the following knowledge base context to inform your reply. "
            "Only use information that is relevant to the email:\n\n"
            f"{context_text}"
        )

    user_prompt = (
        f"Please draft a reply to the following email:\n\n"
        f"From: {from_address}\n"
        f"Subject: {subject}\n\n"
        f"{body_text}"
    )

    return system_prompt, user_prompt


def _generate_openai(api_key: str, system_prompt: str, user_prompt: str) -> str:
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content or ""


def _generate_anthropic(api_key: str, system_prompt: str, user_prompt: str) -> str:
    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.content[0].text


def _generate_gemini(api_key: str, system_prompt: str, user_prompt: str) -> str:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"{system_prompt}\n\n{user_prompt}",
    )
    return response.text or ""


_PROVIDERS = {
    "openai": _generate_openai,
    "anthropic": _generate_anthropic,
    "gemini": _generate_gemini,
}


def generate_draft(
    api_key: str,
    from_address: str,
    to_address: str | None,
    subject: str,
    body_text: str,
    user_name: str | None = None,
    rag_context: list[dict] | None = None,
    provider: str = "openai",
) -> dict:
    """Returns {"draft": str, "llm_context": str} with the reply and full prompt."""
    system_prompt, user_prompt = _build_prompts(
        from_address, to_address, subject, body_text, user_name, rag_context
    )

    llm_context = (
        f"=== PROVIDER: {provider.upper()} ===\n\n"
        f"=== SYSTEM PROMPT ===\n{system_prompt}\n\n"
        f"=== USER PROMPT ===\n{user_prompt}"
    )

    gen_fn = _PROVIDERS.get(provider)
    if not gen_fn:
        raise ValueError(f"Unsupported provider: {provider}")

    draft = gen_fn(api_key, system_prompt, user_prompt)
    return {"draft": draft, "llm_context": llm_context}
