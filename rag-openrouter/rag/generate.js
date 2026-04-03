import axios from "axios";

export async function generateAnswer(question, docs) {
  const context = docs.map(d => d.text).join("\n");

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Answer only using the context provided."
        },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${question}
`
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
}