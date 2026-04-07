import { retrieveContext } from "../services/retrieval.service.js";
import { generateAnswer } from "../services/llm.service.js";

export const askQuestion = async (req, res) => {
  const { question } = req.body;

  const context = await retrieveContext(question);

  const answer = await generateAnswer(question, context);

  res.json({
    question,
    context,
    answer,
  });
};