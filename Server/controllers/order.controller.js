import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import {
    getRazorpay,
    getRazorpayKeyId,
    isRazorpayConfigured,
} from "../config/razorpay.js";

// Shipping details arrive from a form, so they are validated again here. The
// browser's own checks can be bypassed by anyone calling the API directly.
const validateShippingAddress = (address) => {
    if (!address || typeof address !== "object") {
        return "Shipping address is required";
    }

    const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

    for (const field of fields) {
        const value = address[field];
        if (typeof value !== "string" || !value.trim()) {
            return "All shipping fields are required";
        }
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
        return "Enter a valid 10 digit phone number";
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
        return "Pincode must contain 6 digits";
    }

    return null;
};

const cleanAddress = (address) => ({
    fullName: address.fullName.trim(),
    phone: address.phone.trim(),
    addressLine1: address.addressLine1.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
});

// POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
    try {
        const addressError = validateShippingAddress(req.body.shippingAddress);
        if (addressError) {
            return res.status(400).json({ success: false, message: addressError });
        }

        // The cart is read from the database, never from the request body, and
        // populate brings in the latest product data.
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock",
        });

        if (!customer.cart.length) {
            return res
                .status(400)
                .json({ success: false, message: "Your cart is empty" });
        }

        const items = [];
        let totalAmount = 0;

        for (const row of customer.cart) {
            // A product deleted after it was added to the cart populates as null.
            if (!row.product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available",
                });
            }

            // Stock is re-checked here because it can change between adding to
            // the cart and checking out.
            if (row.product.stock < row.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${row.product.name}. Only ${row.product.stock} left.`,
                });
            }

            items.push({
                product: row.product._id,
                name: row.product.name,
                price: row.product.price,
                quantity: row.quantity,
                image: row.product.image,
            });

            // The total is computed from the database price. Anything the
            // frontend sends about amounts is ignored entirely.
            totalAmount += row.product.price * row.quantity;
        }

        // Every business rule above is checked regardless of payment setup.
        // Only the payment step itself needs the keys, so this guard sits here
        // and no pending order is written when they are missing.
        if (!isRazorpayConfigured()) {
            return res.status(503).json({
                success: false,
                message:
                    "Payments are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server .env file.",
            });
        }

        const order = await Order.create({
            user: customer._id,
            items,
            shippingAddress: cleanAddress(req.body.shippingAddress),
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT",
        });

        // Razorpay works in the smallest currency unit, so rupees become paise.
        const razorpayOrder = await getRazorpay().orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString(),
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        // The cart stays untouched: nothing has been paid for yet.
        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: getRazorpayKeyId(),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.error?.description || "Unable to start checkout",
        });
    }
};

// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body;

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid order id" });
        }

        if (!razorpay_payment_id || !razorpay_signature) {
            return res
                .status(400)
                .json({ success: false, message: "Payment details are missing" });
        }

        // Scoping the lookup by user is what stops one customer confirming
        // another customer's order.
        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id,
        });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });
        }

        // Verifying the same payment twice should not fail or clear a cart
        // that has since been refilled.
        if (order.paymentStatus === "PAID") {
            return res
                .status(200)
                .json({ success: true, message: "Payment already verified", order });
        }

        // The order id comes from our own database, not from the browser, so a
        // caller cannot supply a matching pair of their own making.
        const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        const expected = Buffer.from(expectedSignature, "utf8");
        const received = Buffer.from(String(razorpay_signature), "utf8");

        // Comparing in constant time avoids leaking how much of a guessed
        // signature was correct.
        const signatureValid =
            expected.length === received.length &&
            crypto.timingSafeEqual(expected, received);

        if (!signatureValid) {
            // The order stays unpaid and the cart stays exactly as it was.
            return res
                .status(400)
                .json({ success: false, message: "Invalid payment signature" });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Only now, after a verified payment, is the cart emptied.
        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed",
            order,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// POST /orders/:id/payment-failed
export const markPaymentFailed = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid order id" });
        }

        const order = await Order.findOne({ _id: id, user: req.user._id });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });
        }

        // A paid order can never be flipped back by the browser.
        if (order.paymentStatus === "PAID") {
            return res
                .status(409)
                .json({ success: false, message: "Order is already paid" });
        }

        order.paymentStatus = "FAILED";
        await order.save();

        return res
            .status(200)
            .json({ success: true, message: "Payment marked as failed" });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /orders
export const getMyOrders = async (req, res) => {
    try {
        // The filter is built from the authenticated id, so only this
        // customer's orders can ever be returned. Abandoned PENDING orders are
        // left out of the history.
        const orders = await Order.find({
            user: req.user._id,
            paymentStatus: { $ne: "PENDING" },
        }).sort({ createdAt: -1 });

        return res
            .status(200)
            .json({ success: true, count: orders.length, orders });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid order id" });
        }

        // Ownership is part of the query. Someone else's id simply finds
        // nothing, so the response never reveals that the order exists.
        const order = await Order.findOne({ _id: id, user: req.user._id });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// PATCH /orders/:id/status   (bonus: development only)
const NEXT_STATUS = {
    PLACED: "CONFIRMED",
    CONFIRMED: "SHIPPED",
    SHIPPED: "DELIVERED",
};

export const advanceOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid order id" });
        }

        const order = await Order.findOne({ _id: id, user: req.user._id });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });
        }

        if (order.paymentStatus !== "PAID") {
            return res
                .status(400)
                .json({ success: false, message: "Order has not been paid for" });
        }

        const next = NEXT_STATUS[order.status];

        if (!next) {
            return res.status(400).json({
                success: false,
                message: `Order is already ${order.status}`,
            });
        }

        order.status = next;
        await order.save();

        return res
            .status(200)
            .json({ success: true, message: `Order is now ${next}`, order });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};
