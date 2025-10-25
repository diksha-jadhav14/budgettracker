import { createWorker, PSM } from 'tesseract.js';

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  let worker;
  try {
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      errorHandler: (err) => console.error('Tesseract error:', err),
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });

    const { data: { text } } = await worker.recognize(imageBuffer);
    
    await worker.terminate();
    
    return text;
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
    throw error;
  }
}

export function parseTransactionText(text: string): {
  amount: number | null;
  type: 'INCOME' | 'EXPENSE' | null;
  description: string | null;
  confidence: 'high' | 'medium' | 'low';
} {
  const cleanText = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  const amountPatterns = [
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /(?:rs|inr|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /(?:amount|total|amt|paid|price|sum)[\s:]*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d+(?:,\d{3})*\.\d{2})/,
    /(\d+\.\d{2})/,
  ];

  let amount: number | null = null;
  for (const pattern of amountPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0) break;
    }
  }

  const creditKeywords = ['credit', 'deposit', 'salary', 'income', 'received', 'refund', 'payment received', 'credited'];
  const debitKeywords = ['debit', 'withdraw', 'purchase', 'expense', 'paid', 'bill', 'payment', 'spent', 'debited'];

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

  if (!type && amount) {
    type = 'EXPENSE';
    typeConfidence = 0.3;
  }

  const descriptionPatterns = [
    /(?:description|desc|merchant|store|vendor|at)[\s:]+([^\n]{3,50})/i,
    /(?:to|from)[\s:]+([A-Z][A-Za-z\s&]{2,50})/,
    /^([A-Z][A-Za-z\s&]{2,50})(?=\s+(?:\$|rs|inr|₹|\d))/,
  ];

  let description: string | null = null;
  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      description = match[1].trim().substring(0, 100);
      if (description.length > 2) break;
    }
  }

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (amount && type && description) {
    confidence = typeConfidence > 0.7 ? 'high' : 'medium';
  } else if (amount && type) {
    confidence = 'medium';
  } else if (amount) {
    confidence = 'low';
  }

  return {
    amount,
    type,
    description,
    confidence,
  };
}
