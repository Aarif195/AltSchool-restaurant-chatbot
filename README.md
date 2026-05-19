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

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

