const crypto = require("crypto");
const Stripe = require("stripe");
const Razorpay = require("razorpay");
const env = require("../config/env");

const selectedProvider = env.paymentProvider;

const isRazorpayReady =
  selectedProvider === "RAZORPAY" &&
  Boolean(env.razorpayKeyId) &&
  Boolean(env.razorpayKeySecret);

const isStripeReady = selectedProvider === "STRIPE" && Boolean(env.stripeSecretKey);

const provider = isRazorpayReady ? "RAZORPAY" : isStripeReady ? "STRIPE" : "MOCK";

const stripe = provider === "STRIPE" ? new Stripe(env.stripeSecretKey) : null;
const razorpay =
  provider === "RAZORPAY"
    ? new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret
      })
    : null;

const createPaymentSession = async (order) => {
  if (provider === "RAZORPAY" && razorpay) {
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${order.id}`.slice(0, 40),
      notes: {
        orderId: order.id,
        userId: order.userId
      }
    });

    return {
      provider: "RAZORPAY",
      providerPaymentId: razorpayOrder.id,
      clientSecret: null,
      checkoutData: {
        key: env.razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: razorpayOrder.id,
        name: "Swapnaouran Prokashon",
        description: `Payment for order ${order.id}`
      },
      raw: razorpayOrder
    };
  }

  if (provider === "STRIPE" && stripe) {
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: "inr",
      metadata: {
        orderId: order.id,
        userId: order.userId
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      provider: "STRIPE",
      providerPaymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      raw: paymentIntent
    };
  }

  return {
    provider: "MOCK",
    providerPaymentId: `mock_${order.id}_${Date.now()}`,
    clientSecret: null,
    raw: {
      hint: "Use confirmationCode=MOCK_SUCCESS in verify API"
    }
  };
};

const verifyPaymentSession = async ({ paymentRecord, payload }) => {
  if (paymentRecord.provider === "RAZORPAY") {
    if (!env.razorpayKeySecret) {
      return {
        success: false,
        reason: "Razorpay secret key is missing in server config"
      };
    }

    const razorpayOrderId =
      payload.razorpay_order_id || payload.razorpayOrderId || paymentRecord.providerPaymentId;
    const razorpayPaymentId = payload.razorpay_payment_id || payload.razorpayPaymentId;
    const razorpaySignature = payload.razorpay_signature || payload.razorpaySignature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return {
        success: false,
        reason: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required"
      };
    }

    if (razorpayOrderId !== paymentRecord.providerPaymentId) {
      return {
        success: false,
        reason: "Razorpay order mismatch"
      };
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return {
        success: false,
        reason: "Invalid Razorpay signature"
      };
    }

    let fetchedPayment = null;
    if (razorpay) {
      try {
        fetchedPayment = await razorpay.payments.fetch(razorpayPaymentId);
      } catch (_error) {
        fetchedPayment = null;
      }
    }

    if (fetchedPayment && !["captured", "authorized"].includes(fetchedPayment.status)) {
      return {
        success: false,
        reason: `Razorpay payment status is ${fetchedPayment.status}`,
        raw: fetchedPayment
      };
    }

    return {
      success: true,
      providerPaymentId: razorpayPaymentId,
      raw: {
        mode: "RAZORPAY",
        razorpayOrderId,
        razorpayPaymentId,
        fetchedPayment
      }
    };
  }

  if (paymentRecord.provider === "STRIPE" && stripe) {
    const paymentIntentId = payload.paymentIntentId || paymentRecord.providerPaymentId;
    if (!paymentIntentId) {
      return {
        success: false,
        reason: "paymentIntentId is required"
      };
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return {
        success: false,
        reason: `Payment status is ${intent.status}`,
        raw: intent
      };
    }

    return {
      success: true,
      providerPaymentId: intent.id,
      raw: intent
    };
  }

  if (payload.confirmationCode !== "MOCK_SUCCESS") {
    return {
      success: false,
      reason: "Invalid mock confirmation code"
    };
  }

  return {
    success: true,
    providerPaymentId: paymentRecord.providerPaymentId,
    raw: {
      mode: "MOCK",
      verifiedAt: new Date().toISOString()
    }
  };
};

const parseStripeWebhook = (reqBodyBuffer, signature) => {
  if (!stripe || !env.stripeWebhookSecret) {
    return null;
  }

  return stripe.webhooks.constructEvent(reqBodyBuffer, signature, env.stripeWebhookSecret);
};

module.exports = {
  provider,
  createPaymentSession,
  verifyPaymentSession,
  parseStripeWebhook
};
