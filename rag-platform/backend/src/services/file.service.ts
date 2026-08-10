import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (
  file: Express.Multer.File
): Promise<string> => {
  const mimetype = file.mimetype;

  console.log("File type:", mimetype);

  //  PDF
  if (mimetype === "application/pdf") {
    try {
      const parser = new (PDFParse as any)({ data: file.buffer });
      if (typeof parser.load === "function") {
        await parser.load();
      }
      const result = await parser.getText();
      // Remove page header/footer markers like '-- 1 of 2 --'
      const rawText = (result?.text || "").replace(/-- \d+ of \d+ --/g, "").trim();
      console.log(`PDF text extraction completed. Clean text length: ${rawText.length}`);
      if (!rawText) {
        throw new Error(
          "This PDF appears to be an image-based or graphic document without embedded text streams (0 text items found)."
        );
      }
      return rawText;
    } catch (err: any) {
      console.error("Error in PDF extraction:", err.message || err);
      throw new Error(`Failed to extract text from PDF: ${err.message || err}`);
    }
  }

  //  DOCX
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });
    return result.value;
  }

  //  TXT
  if (mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type: " + mimetype);
};