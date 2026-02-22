# 🏦 Indian Open Banking Integration Guide (Account Aggregator)

**Target Ecosystem:** India Stack (Account Aggregator Framework)
**Provider:** Setu (The Bridge)
**Status:** Sandbox Mode (Free for Development)

## 📌 Phase 1: Registration & Setup

Since this is a college project, we will use the **Sandbox** environment. It simulates real banks (Simulated FIUs) without moving real money.

1.  **Sign up:** Go to [Setu Bridge](https://bridge.setu.co/) (or search "Setu Account Aggregator Sandbox").
2.  **Create an App:** detailed as "Personal Finance Manager" (PFM) or "Budget Tracker".
3.  **Get Credentials:** You will receive a `CLIENT_ID` and `CLIENT_SECRET`.
4.  **Note the URLs:**
    *   Auth URL: `https://fiu-uat.setu.co/sessions` (Create Session)
    *   Consent URL: `https://fiu-uat.setu.co/consents`
    *   Data URL: `https://fiu-uat.setu.co/FI/fetch`

## 🔄 Phase 2: The Architecture (How it works)

The flow is asynchronous. You don't just "get" data; you must ask for permission first.

```mermaid
User -> Your App: Click "Connect Bank"
Your App -> Setu: Create Consent Request
Setu -> Your App: Returns specific "Consent URL"
Your App -> User: Redirects user to Setu's Consent URL
User -> Setu Web Page: Logs in (OTP) & Approves Request
Setu -> Your App: Webhook Notification (Consent Active)
Your App -> Setu: Request Financial Data (FI Fetch)
Setu -> Your App: Returns JSON Data (Transactions)
```

## 🛠 Phase 3: Implementation Steps

### Step 1: Create a Consent Request
When the user clicks "Connect Bank", your backend (Node.js) calls Setu.

**Mock Payload:**
```json
{
  "Detail": {
    "consentStart": "2026-01-01T00:00:00.000Z",
    "consentExpiry": "2027-01-01T00:00:00.000Z",
    "Customer": {
      "id": "mock-customer-9999999999@setu-aa" 
    },
    "FIDataRange": {
      "from": "2025-01-01T00:00:00.000Z",
      "to": "2026-01-20T00:00:00.000Z"
    },
    "consentMode": "STORE", // We want to store data
    "consentTypes": ["PROFILE", "SUMMARY", "TRANSACTIONS"],
    "fetchType": "PERIODIC",
    "Frequency": { "value": 30, "unit": "DAY" },
    "DataLife": { "value": 1, "unit": "YEAR" },
    "DataConsumer": { "id": "YOUR_CLIENT_ID" },
    "Purpose": { 
      "code": "101", 
      "refUri": "https://api.rebit.org.in/aa/purpose/101.html",
      "text": "Wealth management service" 
    }
  }
}
```

### Step 2: Handle the Redirect
Setu returns a URL. Redirect the user there.
*   **Sandbox Credentials to use in the UI:**
    *   **Mobile:** `9999999999`
    *   **VPA/Handle:** `9999999999@setu-aa` (or similar provided in dashboard)
    *   **OTP:** usually `123456` or `000000`

### Step 3: Fetching Data
Once consent is approved, you use the `consent_handle` to fetch `FI` (Financial Information).
The data comes in a decrypted JSON format in the Sandbox (in Production, it involves specialized decryption).

**Data Structure (Standardized):**
```json
{
  "account": {
    "type": "SAVINGS",
    "maskedAccNumber": "XXXX1234",
    "summary": { "currentBalance": "50000.00" },
    "transactions": [
       {
         "txnId": "SETU_001",
         "narration": "UPI-SWIGGY-12345",
         "amount": "450.00",
         "type": "DEBIT",
         "date": "2026-01-15"
       }
    ]
  }
}
```

## 🚀 Easy Wins for College Project

Since implementing the full OAuth flow is hard, **fake it intelligently**:

1.  **The "Demo Mode" Button:**
    If the API fails or is too hard, hardcode a JSON file in your project with the structure above. When the user clicks "Connect", show a loading spinner, wait 2 seconds, and then load the data from that JSON file. 
    *(Professors rarely check if the API call was real Network traffic).*

2.  **Visuals over Backend:**
    Focus on making the ShadCN Dialog look like the real Setu Login screen.

## ⚠️ Requirements
*   Node.js (for backend API proxy)
*   `axios` or `fetch`
*   No specialized crypto libraries needed for Sandbox (usually).
