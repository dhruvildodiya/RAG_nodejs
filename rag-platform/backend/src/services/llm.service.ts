import axios from "axios";

import { env } from "../config/env.js";

export const generateAnswer = async (
  question: string,
  context: string
) => {
  const prompt = `
You are a helpful AI assistant.

Answer using the context provided below.
- Base your analysis, ratings, summaries, and answers on the information given in the context.
- If the user asks for an evaluation, rating, feedback, or analysis (such as rating a resume out of 10), analyze the details provided in the context to give a thoughtful and justified rating/answer.
- Use your intelligence to answer basic conversational messages (e.g. greetings) politely.
- If the question is completely unrelated to the context, state "I am not supposed to answer that" and suggest questions related to the context.

Context:
${context}

Question:
${question}
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://rag-nodejs.onrender.com",
          "X-Title": "RAG Backend",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("LLM error:", error.response?.data || error.message);
    throw new Error("Failed to generate answer");
  }
};  