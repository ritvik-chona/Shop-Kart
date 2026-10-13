// Razorpay Checkout is a hosted script, so it has to be injected at runtime.
// The promise resolves false when the network blocks it, which the caller
// turns into a visible error instead of a crash on window.Razorpay.
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
