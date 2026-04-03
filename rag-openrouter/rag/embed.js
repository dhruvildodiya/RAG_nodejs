import axios from "axios";

export async function getEmbedding(text) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/embeddings",
    {
      model: "openai/text-embedding-3-small",
      input: text
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "RAG OpenRouter"
      }
    }
  );

  return response.data.data[0].embedding;
}
