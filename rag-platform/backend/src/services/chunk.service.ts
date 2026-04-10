import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitText = async (text: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  return splitter.createDocuments([text]);
};