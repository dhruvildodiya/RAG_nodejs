import axios from "axios";

import { env } from "../config/env.js";

export const generateAnswer = async (
  question: string,
  context: string
) => {
  const prompt = `
You are a helpful AI assistant.

Answer using the context below.
but be strict and dont use any data outside the context. you can use your intelligence within this context to answer different questions.
use a little bit of your intelligence to answer some basic things like greetings and all and to avoid user from getting "I don't know" as an answer.
if the question is not related to the context at all then you should say something like "I am not supposed to answer that" and sugest some questions related to the context.


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
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("LLM error:", error.response?.data || error.message);
    throw new Error("Failed to generate answer");
  }
};  