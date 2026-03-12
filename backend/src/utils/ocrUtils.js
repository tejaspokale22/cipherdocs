import { Mistral } from "@mistralai/mistralai";

export const extractTextFromPDF = async (buffer) => {
  const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
  });
  // convert buffer → base64
  const base64Pdf = buffer.toString("base64");

  const response = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: "data:application/pdf;base64," + base64Pdf,
    },
  });

  let text = "";

  for (const page of response.pages) {
    text += page.markdown + "\n";
  }

  return cleanOCRText(text);
};

function cleanOCRText(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\|/g, " ")
    .replace(/-{2,}/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
