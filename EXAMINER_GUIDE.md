# 🎓 External Examiner / Demo Guide

This guide is designed to help you showcase the **Smart Financial Discipline Assistant** effectively to an external examiner or during a demo.

## 🚀 Pre-Demo Checklist
1.  **Restart Server**: Ensure you have restarted `npm run dev` to load the latest schema changes.
2.  **Clean State**: Ideally, have a few test transactions ready, or be ready to add them live.

---

## 🎬 Step-by-Step Demo Flow

### **Step 1: The "Wow" Factor (Dashboard)**
*   **Action**: Open the Dashboard.
*   **What to Say**: "This isn't just an expense tracker; it's a financial coach. Notice the **Financial Health Score** at the top."
*   **Highlight**: Point to the **Radial Guage (Score)**. Explain that it aggregates Budget Discipline, Savings, and Goals into a single metric.
    *   *Example*: "Currently, I'm at a 'Good' score of 72 because I'm saving 20% of my income."

### **Step 2: Predictive Intelligence (Projection Card)**
*   **Action**: Scroll to the **Spending Projection** card.
*   **What to Say**: "Most apps react *after* you overspend. Ours predicts it."
*   **Highlight**:
    *   Show the **Projected Spend** vs. **Budget Limit**.
    *   Read the **Smart Coaching Message**: "It tells me exactly how much I should spend per day (e.g., ₹500) to stay on track."
    *   *Demonstration*: If you add a large expense (Step 3), show how this projection updates instantly to a warning state.

### **Step 3: Receipt Scanning (OCR)**
*   **Action**: Click **"Add Transaction"** -> **"Upload Receipt"**.
*   **What to Say**: "We use OCR to reduce friction in tracking expenses."
*   **Highlight**:
    *   Upload a sample receipt image.
    *   Show how it auto-fills the **Amount** and **Merchant**.
    *   If the image is blurry, point out the **"Receipt Unclear" warning**, demonstrating error handling and good UX.

### **Step 4: Goal Tracking**
*   **Action**: Show the **"My Saving Goals"** section.
*   **What to Say**: "Financial discipline isn't just about cutting costs; it's about building limits."
*   **Highlight**:
    *   Create a new goal (e.g., "Goa Trip").
    *   Set a target amount (e.g., ₹15,000).
    *   Show the progress bar filling up as you allocate funds.

### **Step 5: Mobile Responsiveness & Polish**
*   **Action**: Resize the browser window to mobile size.
*   **What to Say**: "The entire application is fully responsive and built with a mobile-first approach using modern UI components."
*   **Highlight**:
    *   Smooth animations (Framer Motion).
    *   Clean, vibrant aesthetics (Gradient backgrounds, Glassmorphism).

---

## ❓ Anticipated Questions & Answers

**Q: How is the Financial Health Score calculated?**
**A:** "It uses a weighted algorithm: 40% for staying under budget, 25% for positive cash flow (savings), 15% for impulse control (sticking to category limits), and 20% for active goal progress."

**Q: Is the OCR AI-based?**
**A:** "Yes, we use Tesseract.js for optical character recognition, refined with custom regex patterns to accurately identify totals and transaction types."

**Q: How does the projection work?**
**A:** "It calculates the daily spending average and extrapolates it to the end of the month, comparing it against the defined total budget."
