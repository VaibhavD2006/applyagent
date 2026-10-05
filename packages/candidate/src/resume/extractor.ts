import { readFile } from "fs/promises";
import { extname } from "path";

/**
 * Extracts plain text from PDF, DOCX, or TXT files.
 * Returns raw text for passing to LLMExtractor.
 */
export async function extractResumeText(filePath: string): Promise<string> {
  const ext = extname(filePath).toLowerCase();
  const buf = await readFile(filePath);

  if (ext === ".txt") {
    return buf.toString("utf-8");
  }

  if (ext === ".pdf") {
    // Dynamic import avoids loading pdf-parse unless needed
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buf);
    return result.text;
  }

  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value;
  }

  throw new Error(`Unsupported resume format: ${ext}. Use .pdf, .docx, or .txt`);
}
