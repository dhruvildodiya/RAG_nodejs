import axios from "axios";

export const generateAnswer = async (question, context) => {
  const prompt = `
You are a helpful assistant.

Answer ONLY from the context below.
If not found, say "I don't know".

Context:
${context.join("\n")}

Question:
${question}
`;

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    }
  );

  return res.data.choices[0].message.content;
};