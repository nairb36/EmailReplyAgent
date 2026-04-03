from openai import OpenAI


def generate_draft(
    api_key: str,
    from_address: str,
    to_address: str | None,
    subject: str,
    body_text: str,
    user_name: str | None = None,
) -> str:
    client = OpenAI(api_key=api_key)

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

    user_prompt = (
        f"Please draft a reply to the following email:\n\n"
        f"From: {from_address}\n"
        f"Subject: {subject}\n\n"
        f"{body_text}"
    )

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
