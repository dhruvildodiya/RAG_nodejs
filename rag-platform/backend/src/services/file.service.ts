import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (
  file: Express.Multer.File
): Promise<string> => {
  const mimetype = file.mimetype;

  console.log("File type:", mimetype);

  //  PDF
  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    return result.text;
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