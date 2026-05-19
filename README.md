# Restaurant ChatBot API (Backend)

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
FRONTEND_PAYMENT_CALLBACK_URL=http://localhost:5173/payment/success


## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# Install dependencies
$ npm install

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
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
  "message": "hello"
}
```

---

### Step 2 — Fetch Menu Items

Send:

```json
{
  "message": "1"
}
```

This should return the available menu items.

---

### Step 3 — Add Item to Cart

Send:

```json
{
  "message": "11"
}
```

This adds **Jollof Rice** to the cart.

---

### Step 4 — View Cart

Send:

```json
{
  "message": "97"
}
```

This should return the current cart items and total order amount.

---

### Step 5 — Checkout

Send:

```json
{
  "message": "99"
}
```



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

