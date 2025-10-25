# Testing Guide - OCR Image Upload Feature

## Quick Start

```bash
# Ensure database is running
npm run setup

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## Test Scenarios

### 1. Basic Receipt Upload

**Steps:**
1. Login to the app
2. Navigate to Dashboard
3. Click "Add Transaction" button
4. Switch to "Upload Receipt" tab
5. Click to upload or drag an image
6. Click "Process with OCR"
7. Wait for processing (2-5 seconds)
8. Review extracted data
9. Edit if needed
10. Click "Save Transaction"

**Expected Result:**
- Image preview shown
- Progress updates in console
- Extracted data displayed with confidence badge
- Form pre-filled with detected values
- Transaction saved to database
- Toast notification: "Transaction saved successfully!"
- Dashboard refreshes with new transaction

### 2. Test with Different Image Types

#### A. Clear Receipt (Best Case)
**Use:** Digital receipt screenshot or high-quality photo
**Expected:** High confidence, accurate extraction

#### B. ATM Receipt
**Contains:** 
- Amount: $100.00
- Type keyword: "Withdrawal" or "Deposit"
- Merchant: "Bank Name"

**Expected:** Medium to high confidence

#### C. Blurry Image (Edge Case)
**Expected:** Low confidence, may require manual correction

### 3. Test Transaction Types

#### Income Test
Upload receipt containing keywords:
- "Credit"
- "Deposit"
- "Received"
- "Salary"
- "Refund"

**Expected:** Type = INCOME

#### Expense Test
Upload receipt containing keywords:
- "Debit"
- "Paid"
- "Purchase"
- "Withdrawal"
- "Bill Payment"

**Expected:** Type = EXPENSE

### 4. Amount Detection Tests

Try receipts with different formats:

```
✅ $50.00
✅ $1,234.56
✅ Rs. 500
✅ ₹1,000
✅ Amount: 75.50
✅ Total: $99.99
✅ 45.00
```

### 5. Error Handling Tests

#### A. No Image
- Try processing without selecting an image
- **Expected:** Error toast: "No image provided"

#### B. Large File
- Upload file > 5MB
- **Expected:** Error toast: "Image size should be less than 5MB"

#### C. Non-Image File
- Upload a PDF or text file
- **Expected:** Error toast: "Please select an image file"

#### D. Server Error Simulation
- Check console for detailed error messages
- **Expected:** Error toast with helpful message

### 6. Manual Entry Fallback

**Steps:**
1. Click "Add Transaction"
2. Stay on "Manual Entry" tab
3. Fill form manually
4. Save

**Expected:** Works independently of OCR feature

## Sample Test Images

### Create Test Receipts

You can use online tools to generate test receipts:

1. **Receipt Generator**: 
   - Create fake receipts with custom amounts
   - https://receipt-generator.com

2. **Bank Statement Screenshot**:
   - Take screenshot of online banking transaction
   - Ensure sensitive info is hidden

3. **ATM Receipt Photo**:
   - Take photo of recent ATM receipt
   - Good for testing various formats

### Example Receipt Text Formats

**Format 1: Store Receipt**
```
SUPERMART GROCERY
Date: 01/22/2024
Amount Paid: $45.99
Payment Method: Card
Transaction: Purchase
```

**Format 2: ATM Receipt**
```
BANK OF AMERICA ATM
Withdrawal
Amount: $100.00
Date: 22-JAN-2024
Balance: $1,234.56
```

**Format 3: Payment Confirmation**
```
Payment Received
From: John Doe
Amount: Rs. 5000
Ref: TXN123456789
Date: 22/01/2024
```

## Console Logs to Watch

When testing, open browser console (F12) to see:

```javascript
// Starting OCR
Starting OCR processing...

// Progress updates
OCR Progress: 25%
OCR Progress: 50%
OCR Progress: 75%
OCR Progress: 100%

// Completion
OCR completed. Extracted text length: 245

// Raw extracted text
{ 
  rawText: "STORE NAME\nAmount: $50.00\nPaid\n...",
  parsed: {
    amount: 50.00,
    type: "EXPENSE",
    description: "STORE NAME",
    confidence: "high"
  }
}
```

## Troubleshooting

### Issue: "Failed to process image"

**Possible Causes:**
1. Tesseract worker failed to initialize
2. Image format not supported
3. Memory limit exceeded

**Solutions:**
1. Refresh the page
2. Try a smaller image
3. Check console for detailed error
4. Try a different image format (PNG instead of JPEG)

### Issue: Low accuracy

**Solutions:**
1. Use higher quality images
2. Ensure good lighting and contrast
3. Keep text horizontal (not rotated)
4. Use clear, printed text (not handwritten)
5. Manually correct extracted data

### Issue: Slow processing

**Normal Behavior:**
- First request: 3-5 seconds (downloads language data)
- Subsequent requests: 1-2 seconds

**If slower:**
1. Check internet connection (first-time language download)
2. Check image file size
3. Monitor server console for errors

## API Testing (Optional)

### Direct API Test with cURL

```bash
# 1. Login and get session cookie
# (Use browser to login first)

# 2. Test OCR API
curl -X POST http://localhost:3000/api/upload/ocr \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/receipt.jpg"

# Expected Response:
{
  "success": true,
  "rawText": "...",
  "parsed": {
    "amount": 50.00,
    "type": "EXPENSE",
    "description": "Store Name",
    "confidence": "high"
  }
}

# 3. Test Transaction Save
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "description": "Test Transaction",
    "type": "EXPENSE",
    "date": "2024-01-22"
  }'
```

## Performance Benchmarks

Expected timings on average hardware:

| Operation | First Time | Subsequent |
|-----------|-----------|------------|
| Worker Init | 1-2s | N/A |
| Language Download | 2-3s | N/A (cached) |
| Image Recognition | 1-2s | 1-2s |
| Parse & Display | <100ms | <100ms |
| **Total** | **3-5s** | **1-2s** |

## Success Criteria

✅ **Phase 3 Complete When:**
- [ ] Can upload images successfully
- [ ] OCR extracts text from receipts
- [ ] Parser detects amounts accurately
- [ ] Parser determines INCOME vs EXPENSE
- [ ] User can edit extracted data
- [ ] Transactions save to database
- [ ] Dashboard shows new transactions
- [ ] Error handling works gracefully
- [ ] Build completes without errors
- [ ] No console errors in normal operation

## Next Steps (Phase 4)

After confirming Phase 3 works:
1. Collect real-world receipt samples
2. Improve parser rules based on common patterns
3. Add category auto-detection
4. Implement budget insights and suggestions

---

**Last Updated:** Phase 3 Implementation
**Status:** ✅ Ready for Testing
