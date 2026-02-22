# 🚀 Application Features Documentation

This document outlines the key features implemented in the **Smart Financial Discipline Assistant**, specifically designed to gamify budget tracking and provide intelligent financial coaching.

## 1. 🥇 Financial Health Score (Gamified Core System) [New]

**Concept:**
Instead of just tracking expenses, the app calculates a single "Health Score" (0-100) that represents the user's overall financial discipline. This acts as an emotional anchor to encourage better habits.

**Scoring Logic:**
The score is calculated based on four weighted pillars:

1.  **Budget Discipline (40%)**:
    *   **+40 points**: Spending is under 80% of the total budget (Safe Zone).
    *   **+25 points**: Spending is between 80-100% (Warning Zone).
    *   **+10 points**: Spending exceeds 100% (Danger Zone).

2.  **Savings Contribution (25%)**:
    *   **+25 points**: Income > Expenses (Positive Savings).
    *   **+5 points**: Income <= Expenses (No Savings).

3.  **Impulse Control (15%)**:
    *   **+15 points**: No single budget category has been exceeded.
    *   **+5 points**: One or more budget categories have been exceeded.

4.  **Goal Progress (20%)**:
    *   **+20 points**: The user has at least one active savings goal with money allocated.
    *   **+10 points**: Goals exist but no progress yet.
    *   **+5 points**: No goals set.

**User Interface:**
*   **Visual**: A radial progress ring on the dashboard.
*   **Status Levels**:
    *   💚 **Excellent (80-100)**
    *   🔵 **Good (60-79)**
    *   🟡 **Needs Improvement (40-59)**
    *   🔴 **Risk Zone (0-39)**

---

## 2. 🥈 AI-Lite Future Spending Projection [New]

**Concept:**
Most budget apps only warn you *after* you've overspent. This feature predicts *future* spending based on current habits to warn the user *before* it happens.

**Algorithm:**
*   **Daily Average**: `Total Spent / Current Day of Month`
*   **Projection**: `Daily Average × Total Days in Month`

**Smart Coaching:**
The app provides contextual advice based on the projection:
*   **If Risks Overspending**:
    *   *Message:* "To stay within your limit, try to limit daily spending to ₹X."
    *   *Visual:* Red progress bar indicating the projected overage.
*   **If On Track**:
    *   *Message:* "Great job! You are on track to spend ₹X, which is well within your budget."
    *   *Visual:* Green progress bar.

---

## 3. 📸 Receipt Scanning (OCR)

**Concept:**
Simplifies transaction entry by extracting data from receipt images.

**Features:**
*   **Auto-Extraction**: Detects Amount, Date, and Merchant Name.
*   **Clarity Check**: Analyzes image quality and warns if the receipt is blurry ("⚠️ Receipt unclear").
*   **Manual Override**: Allows users to correct extracted data before saving.

---

## 4. 🎯 Savings Goal Tracker

**Concept:**
Allows users to set and track specific financial goals (e.g., "New Phone", "Vacation").

**Features:**
*   **Visual Progress**: Progress bars for each goal.
*   **dedicated Section**: A clear "My Saving Goals" dashboard.
*   **Quick Add**: Easily allocate funds to specific goals.

---

## 5. 💡 Motivational Suggestion Engine

**Concept:**
Provides personalized, behavioral nudges to encourage better financial decisions.

**Types of Nudges:**
*   **Praise**: "Great discipline! You haven't made an impulse buy in 3 days."
*   **Warning**: "You've spent 40% of your food budget in just 5 days."
*   ** Insight**: "You could save ₹2,000 this month if you cut back on dining out."
