import { createWorker, PSM } from "tesseract.js";

export interface OCRResult {
  amount: number | null;
  type: "INCOME" | "EXPENSE" | null;
  description: string | null;
  confidence: "high" | "medium" | "low";
  rawText: string; // This will now contain the raw text from Tesseract
}

export async function extractTextFromImage(
  imageBuffer: Buffer,
): Promise<string> {
  let worker;
  try {
    worker = await createWorker("eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });

    const {
      data: { text },
    } = await worker.recognize(imageBuffer);

    await worker.terminate();

    return text;
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
    console.error("Tesseract failure", error);
    throw error;
  }
}

export function parseTransactionText(text: string): {
  amount: number | null;
  type: "INCOME" | "EXPENSE" | null;
  description: string | null;
  confidence: "high" | "medium" | "low";
} {
  // Normalize text to fix common OCR read errors on bad receipts
  const cleanText = text
    .toLowerCase()
    .replace(/\s+/g, " ")
    // Replace letters that look like numbers when near digits
    .replace(/[sz]\s*(\d)/gi, "5$1")
    .replace(/[oO]\s*(\d)/g, "0$1")
    .replace(/[lI]\s*(\d)/g, "1$1")
    .replace(/(\d)\s*[sS]/g, "$15")
    .trim();

  // Find all numbers that could realistically be a total/price
  // Matches 1,234.56 | 1234.56 | 12.34 | ₹12.34
  const numRegex =
    /(?:rs|inr|rupees?|total|amt|amount|paid|sum|₹|pay|net|due)?[\s:=-]*((?:\d{1,3}[, ])*(?:\d{3})(?:[\.,]\d{2})?|\d+(?:[\.,]\d{2})?)/g;

  let match;
  let amounts: number[] = [];

  while ((match = numRegex.exec(cleanText)) !== null) {
    // clean up commas or spaces from number string
    let rawNum = match[1].replace(/[, ]/g, "");
    let val = parseFloat(rawNum);
    // filter out impossible numbers (e.g. phone numbers misread as amounts)
    if (!isNaN(val) && val > 0 && val < 5000000) {
      amounts.push(val);
    }
  }

  // Pure fallback: find any standard decimal numbers
  const plainNumRegex = /(\d+\.\d{2})/g;
  while ((match = plainNumRegex.exec(cleanText)) !== null) {
    let val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0 && val < 5000000) {
      amounts.push(val);
    }
  }

  // The 'total' on a receipt is usually the largest numerical value present.
  let finalAmount = null;
  if (amounts.length > 0) {
    amounts.sort((a, b) => b - a);
    finalAmount = amounts[0]; // Take the max amount
  }

  const creditKeywords = [
    "credit",
    "deposit",
    "salary",
    "income",
    "received",
    "refund",
    "saving",
  ];
  const debitKeywords = [
    "debit",
    "withdraw",
    "purchase",
    "expense",
    "paid",
    "bill",
    "total",
    "tax",
    "store",
    "shop",
    "mart",
    "supermarket",
    "cafe",
    "restaurant",
  ];

  let type: "INCOME" | "EXPENSE" | null = null;
  let typeScore = 0;

  for (const keyword of creditKeywords) {
    if (cleanText.includes(keyword)) typeScore -= 2;
  }
  for (const keyword of debitKeywords) {
    if (cleanText.includes(keyword)) typeScore += 1;
  }

  if (typeScore > 0) type = "EXPENSE";
  else if (typeScore < 0) type = "INCOME";
  else type = "EXPENSE"; // Default to expense for standard receipts if ambiguous

  // Description extraction
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && !/^\d+$/.test(l)); // ignore purely numeric lines

  let description = null;

  if (lines.length > 0) {
    // The top text of a receipt is usually the merchant name
    for (let line of lines) {
      const lowerLine = line.toLowerCase();
      if (
        /[A-Za-z]{4,}/.test(line) &&
        !lowerLine.includes("total") &&
        !lowerLine.includes("date") &&
        !lowerLine.includes("tax") &&
        !lowerLine.includes("visa") &&
        !lowerLine.includes("mastercard") &&
        !lowerLine.includes("cash")
      ) {
        description = line
          .substring(0, 40)
          .replace(/[^a-zA-Z0-9\s&]/g, "")
          .trim();

        // Capitalize nicely
        description = description.replace(/\b\w/g, (c) => c.toUpperCase());
        if (description.length >= 3) {
          break;
        }
      }
    }
  }

  if (!description) description = "Unknown Merchant";

  // Compute confidence based on how much was successfully extracted
  let confidence: "high" | "medium" | "low" = "low";
  if (
    finalAmount &&
    description !== "Unknown Merchant" &&
    Math.abs(typeScore) >= 1
  ) {
    confidence = "high";
  } else if (finalAmount && type) {
    confidence = "medium";
  }

  return {
    amount: finalAmount,
    type,
    description,
    confidence,
  };
}
