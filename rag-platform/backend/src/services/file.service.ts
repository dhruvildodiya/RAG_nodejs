import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";
import Tesseract from "tesseract.js";
import { pdf } from "pdf-to-img";

/**
 * Parses images or PDFs using Google Gemini Vision AI (Free Tier API)
 */
async function extractTextWithGemini(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = buffer.toString("base64");

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
  ];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimetype,
                },
              },
              {
                text: "Extract and structure all content from this document/image accurately. Start with a brief 1-2 sentence overview header describing what this document/image is (e.g. '# Summary of Chat Screenshot' or '# Document Overview'), preserve conversation flow or section headers, convert tables into Markdown tables, and transcribe all text details.",
              },
            ],
          },
        ],
      });

      const extractedText = response.text?.trim() || "";
      if (extractedText) {
        return extractedText;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model '${modelName}' unavailable:`, err?.message || err);
    }
  }

  throw lastError || new Error("Gemini returned empty text response.");
}

/**
 * 100% Free Local OCR fallback using Tesseract.js & pdf-to-img
 */
async function extractTextWithLocalOcr(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  console.log(`Running local Tesseract OCR fallback for ${mimetype}...`);

  // Standard Image (PNG, JPG, WEBP, etc.)
  if (mimetype.startsWith("image/")) {
    const { data } = await Tesseract.recognize(buffer, "eng");
    return data.text.trim();
  }

  // PDF page-by-page OCR
  if (mimetype === "application/pdf") {
    const document = await pdf(buffer, { scale: 2 });
    let combinedText = "";
    let pageNum = 1;

    for await (const pageImage of document) {
      console.log(`[Tesseract OCR] Processing PDF page ${pageNum}...`);
      const { data } = await Tesseract.recognize(pageImage, "eng");
      if (data.text.trim()) {
        combinedText += `\n--- Page ${pageNum} ---\n` + data.text.trim();
      }
      pageNum++;
    }
    return combinedText.trim();
  }

  throw new Error(`Local OCR does not support mimetype: ${mimetype}`);
}

/**
 * Tries Gemini Vision first if configured, then falls back to local Tesseract OCR
 */
async function extractTextWithFallback(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("Attempting text extraction via Gemini Vision AI...");
      return await extractTextWithGemini(buffer, mimetype);
    } catch (err: any) {
      console.warn(
        "Gemini Vision extraction failed/failed over. Falling back to local Tesseract OCR:",
        err?.message || err
      );
    }
  } else {
    console.log("GEMINI_API_KEY not found. Defaulting to local Tesseract OCR...");
  }

  return await extractTextWithLocalOcr(buffer, mimetype);
}

export const extractTextFromFile = async (
  file: Express.Multer.File
): Promise<string> => {
  const mimetype = file.mimetype;

  console.log("Processing uploaded file type:", mimetype);

  // 1. PDF Handling
  if (mimetype === "application/pdf") {
    try {
      const parser = new (PDFParse as any)({ data: file.buffer });
      if (typeof parser.load === "function") {
        await parser.load();
      }
      const result = await parser.getText();
      const rawText = (result?.text || "").replace(/-- \d+ of \d+ --/g, "").trim();

      if (rawText.length > 50) {
        console.log(`Digital PDF text extracted successfully. Clean length: ${rawText.length}`);
        return rawText;
      }
      console.log("PDF contains little to no embedded digital text. Triggering OCR/Vision engine...");
    } catch (err: any) {
      console.warn("Digital PDF parse failed. Triggering OCR/Vision fallback:", err.message || err);
    }

    return await extractTextWithFallback(file.buffer, mimetype);
  }

  // 2. Image Handling (PNG, JPEG, WEBP, BMP, etc.)
  if (mimetype.startsWith("image/")) {
    return await extractTextWithFallback(file.buffer, mimetype);
  }

  // 3. DOCX Handling
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });
    return result.value;
  }

  // 4. Plain Text Handling
  if (mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type: " + mimetype);
};