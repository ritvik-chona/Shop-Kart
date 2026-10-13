import Razorpay from "razorpay";

// The keys are read when they are first needed, not when this file is imported.
// ES modules evaluate the whole import graph before index.js runs its own code,
// so dotenv.config() has not happened yet at import time and reading
// process.env here at the top level would always see undefined.

let client = null;

export const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// Only the Key Id may be sent to the browser. The secret stays in this process.
export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID;

export const getRazorpay = () => {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
};
