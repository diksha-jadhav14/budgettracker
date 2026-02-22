import { createWorker, PSM } from 'tesseract.js';

export async function extractTextFromImage(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
  let worker;
  try {
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      errorHandler: (err) => console.error('Tesseract error:', err),
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });

    const { data: { text, confidence } } = await worker.recognize(imageBuffer);

    await worker.terminate();

    return { text, confidence };
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => { });
    }
    throw error;
  }
}

export function parseTransactionText(text: string, ocrConfidence: number): {
  amount: number | null;
  type: 'INCOME' | 'EXPENSE' | null;
  description: string | null;
  confidence: 'high' | 'medium' | 'low';
  isUnclear: boolean;
} {
  const cleanText = text.toLowerCase().replace(/\s+/g, ' ').trim();

  // 1. Better Amount Detection (Prioritize Totals)
  const totalPatterns = [
    /(?:total|grand total|net amount|amount due|to pay)\s*[:=-]?\s*(?:₹|rs|inr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:total|amount)\s*[:=-]?\s*(?:₹|rs|inr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
  ];

  let amount: number | null = null;

  // Try finding explicit Total first
  for (const pattern of totalPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Fallback: Find largest number with currency symbol
  if (!amount) {
    const currencyPattern = /(?:₹|rs|inr)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
    const matches = [...cleanText.matchAll(currencyPattern)];
    let maxAmount = 0;

    for (const match of matches) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val > maxAmount) maxAmount = val;
    }

    if (maxAmount > 0) amount = maxAmount;
  }

  // Fallback: Just find any decent looking number (last resort)
  if (!amount) {
    const numberPattern = /(\d+(?:,\d{3})*\.\d{2})/g;
    const matches = [...cleanText.matchAll(numberPattern)];
    // Usually the total is the last number or the largest
    let maxAmount = 0;
    for (const match of matches) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val > maxAmount && val < 1000000) maxAmount = val; // Sanity check
    }
    if (maxAmount > 0) amount = maxAmount;
  }

  // 2. Type Detection
  const creditKeywords = ['credit', 'deposit', 'salary', 'income', 'received', 'refund', 'payment received', 'credited'];
  const debitKeywords = ['debit', 'withdraw', 'purchase', 'expense', 'paid', 'bill', 'payment', 'spent', 'debited', 'merchant', 'store', 'retail'];

  let type: 'INCOME' | 'EXPENSE' | null = null;
  let typeConfidence = 0;

  for (const keyword of creditKeywords) {
    if (cleanText.includes(keyword)) {
      type = 'INCOME';
      typeConfidence = 1;
      break;
    }
  }

  if (!type) {
    for (const keyword of debitKeywords) {
      if (cleanText.includes(keyword)) {
        type = 'EXPENSE';
        typeConfidence = 1;
        break;
      }
    }
  }

  // Default to EXPENSE for receipts if found amount but no clear type
  if (!type && amount) {
    type = 'EXPENSE';
    typeConfidence = 0.5;
  }

  // 3. Description Detection
  // Look for text at the top (Merchant name usually)
  const lines = text.split('\n').filter(l => l.trim().length > 3);
  let description: string | null = null;

  if (lines.length > 0) {
    // First line is often the Merchant
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && !firstLine.match(/\d/)) {
      description = firstLine;
    } else {
      // Look for known patterns
      const descriptionPatterns = [
        /(?:merchant|store|vendor|at)[\s:]+([^\n]{3,50})/i,
        /^(?:welcome to )?([A-Z][A-Za-z\s&]{2,50})/i,
      ];

      for (const pattern of descriptionPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          description = match[1].trim();
          break;
        }
      }
    }
  }

  // 4. Overall Confidence & Clarity Check
  let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
  let isUnclear = false;

  if (ocrConfidence < 60) {
    isUnclear = true;
    confidenceLevel = 'low';
  } else {
    if (amount && type && description) {
      confidenceLevel = 'high';
    } else if (amount) {
      confidenceLevel = 'medium';
    }
  }

  return {
    amount,
    type,
    description: description ? description.replace(/[^\w\s&]/g, '').trim() : null,
    confidence: confidenceLevel,
    isUnclear,
  };
}
