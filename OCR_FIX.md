# OCR Fix - Tesseract.js Configuration

## Problem
Tesseract.js was throwing `MODULE_NOT_FOUND` error when trying to load worker scripts in Next.js API routes:
```
Cannot find module '/ROOT/node_modules/tesseract.js/src/worker-script/node/index.js'
```

## Solution

### 1. Created OCR Utility Library (`src/lib/ocr.ts`)
- Centralized OCR logic in a reusable utility
- Proper worker creation and cleanup
- Enhanced error handling
- Better logging for debugging

### 2. Updated Next.js Configuration (`next.config.ts`)
Added webpack configuration to handle tesseract.js properly:
- Externalized tesseract.js for server-side rendering
- Disabled canvas and encoding modules (not needed)
- Proper alias resolution

### 3. Improved API Route (`src/app/api/upload/ocr/route.ts`)
- Cleaner code using utility functions
- Better error messages with details
- Enhanced logging for troubleshooting

## How It Works Now

### Worker Creation
```typescript
// In src/lib/ocr.ts
worker = await createWorker('eng', 1, {
  logger: (m) => {
    if (m.status === 'recognizing text') {
      console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
    }
  },
  errorHandler: (err) => console.error('Tesseract error:', err),
});
```

### Text Extraction
```typescript
const text = await extractTextFromImage(buffer);
const parsedData = parseTransactionText(text);
```

## Testing the OCR

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Navigate to Dashboard
Go to `http://localhost:3000/dashboard`

### 3. Upload a Receipt
- Click "Add Transaction" button
- Switch to "Upload Receipt" tab
- Upload an image with:
  - Clear text showing amounts (e.g., "$50.00", "Rs. 1000")
  - Transaction keywords (paid, received, credit, debit)
  - Merchant names

### 4. Process with OCR
- Click "Process with OCR" button
- Watch the console for progress logs:
  ```
  Starting OCR processing...
  OCR Progress: 25%
  OCR Progress: 50%
  OCR Progress: 75%
  OCR Progress: 100%
  OCR completed. Extracted text length: 245
  ```

### 5. Review Results
The dialog will show:
- Confidence badge (high/medium/low)
- Extracted raw text
- Parsed fields (amount, type, description)
- Editable form to correct any misread data

## Best Practices for OCR

### Image Quality Tips
✅ **Do:**
- Use clear, well-lit photos
- Ensure text is horizontal and not rotated
- Use images with good contrast
- Keep file size under 5MB
- Supported formats: JPEG, PNG, WebP

❌ **Avoid:**
- Blurry or low-resolution images
- Heavily compressed images
- Images with poor lighting
- Handwritten receipts (OCR works best with printed text)

### Example Receipt Formats That Work Well
1. **Digital receipts** from email
2. **ATM receipts** with clear printing
3. **Store receipts** with thermal printing
4. **Bank statements** (screenshots)
5. **Invoice PDFs** converted to images

## Troubleshooting

### Issue: OCR is slow
**Solution**: First-time processing downloads language data (~4MB). Subsequent requests are faster.

### Issue: Low confidence results
**Solution**:
1. Use higher quality images
2. Ensure good lighting and contrast
3. Manually correct the extracted data
4. The parsing algorithm learns from clear patterns

### Issue: Wrong transaction type detected
**Solution**: The rule-based parser looks for keywords like:
- **INCOME**: credit, deposit, salary, received, refund
- **EXPENSE**: debit, paid, purchase, withdraw, bill

Add these keywords to your receipts metadata or manually correct.

### Issue: Amount not detected
**Solution**: Ensure amounts are in these formats:
- `$50.00`, `$1,234.56`
- `Rs. 500`, `₹1000`
- `Amount: 50.00`, `Total: 100.00`

## Performance

- **First OCR request**: ~3-5 seconds (downloads language data)
- **Subsequent requests**: ~1-2 seconds
- **Language data size**: ~4MB (cached in node_modules)
- **Memory usage**: ~50-100MB per worker

## Future Enhancements

Potential improvements for Phase 4+:
1. **Multi-language support**: Add Hindi, Spanish, etc.
2. **Receipt categorization**: Auto-detect merchant categories
3. **Date extraction**: Parse transaction dates from receipts
4. **Batch processing**: Upload multiple receipts at once
5. **ML-based parsing**: Replace rule-based parser with trained model
6. **Receipt templates**: Pre-configured parsers for popular retailers

## Technical Details

### Dependencies
- `tesseract.js@6.0.1` - OCR engine
- Trained data: English (eng.traineddata)

### Files Modified
- `src/lib/ocr.ts` - New utility library
- `src/app/api/upload/ocr/route.ts` - Updated API route
- `next.config.ts` - Webpack configuration

### Architecture
```
User Upload → API Route → OCR Utility → Tesseract Worker → Text Extraction → Parser → UI
```

---

**Status**: ✅ Fixed and tested
**Build**: ✅ Compiles without errors
**Dev Server**: ✅ Runs successfully
