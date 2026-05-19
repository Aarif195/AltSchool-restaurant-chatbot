export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  database: {
    uri: process.env.MONGODB_URI || "",
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    callbackUrl: process.env.FRONTEND_PAYMENT_CALLBACK_URL,
  },
});