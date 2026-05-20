# Restaurant ChatBot API

A stateful, session-based chatbot REST API built with NestJS and MongoDB Atlas to manage customer restaurant orders with integrated Paystack payment processing.

## Features
- **Session-based Tracking:** Tracks users dynamically using unique device IDs without requiring accounts or logins.
- **State Machine Routing:** Manages state transitions cleanly (`MAIN_MENU` -> `VIEWING_MENU` -> `AWAITING_PAYMENT`).
- **Paystack Payment Gateway:** Generates live checkout links and securely tracks verification via raw body webhooks.

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Account

## Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
FRONTEND_PAYMENT_CALLBACK_URL=http://localhost:5173/


## Installation & Execution

```bash
$ npm install
```

## Compile and run the project

```bash
# Navigate to the backend directory (if nested)
$ cd restaurant-chatbot

# Install dependencies
$ npm install

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

```bash
# Navigate to the frontend directory from project root
$ cd restaurant-chatbot-ui

# Install UI assets and packages
$ npm install

# Launch local Vite dev server
$ npm run dev
```

## API Testing Guide (Postman / cURL)

### 1. Process Chat Options

**Endpoint**

```http
POST /chat/message
```

### Headers

```http
x-device-id: <unique-device-identifier>
Content-Type: application/json
```
## Testing Checklist Sequence

### Step 1 — Initialize Session

### Request Body

Send an empty or random message first to initialize the session.

Example:

```json
{
  "message": ""
}
```

---

### Step 2 — Fetch Menu Items

Send option 1 to fetch current dishes available in the database.

```json
{
  "message": "1"
}
```

This should return the available menu items.

---

### Step 3 — Add Item to Cart

Send a specific food identifier menu code (e.g., 11 for Jollof Rice) to insert an item into your active cart record.

```json
{
  "message": "11"
}
```

This adds **Jollof Rice** to the cart.

---

### Step 4 — View Cart

Send option 97 to compute the total price array and see what items are currently staged.

```json
{
  "message": "97"
}
```

This should return the current cart items and total order amount.

---

### Step 5 — Checkout

Send option 99 to lock your items and transition your system state.

```json
{
  "message": "99"
}
```
Note: The bot will reply requesting you to enter your email address to route the payload.

Send the email address, e.g. 

```json
{
  "message": "[EMAIL_ADDRESS]"
}
```

The backend will return a live secure Paystack authorization_url. Open this URL inside your browser window to process the test payment loop.

---

### 2. Paystack Webhook Event Listener

**Endpoint**

```http
POST /payment/webhook
```

### Headers

```http
x-paystack-signature: <computed-hmac-sha512-signature>
```

---



The backend should return a live Paystack `authorization_url`.

Copy the URL into your browser, complete the test payment, and confirm the payment status is successful.

