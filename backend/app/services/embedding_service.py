from openai import OpenAI


def get_embedding(api_key: str, text: str) -> list[float]:
    """Generate an embedding vector for the given text using OpenAI."""
    client = OpenAI(api_key=api_key)
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding


def get_embeddings_batch(api_key: str, texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts in a single API call."""
    client = OpenAI(api_key=api_key)
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts,
    )
    return [item.embedding for item in response.data]
