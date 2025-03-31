const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
require("dotenv").config();

// ✅ Initialize Razorpay with Secret Key
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Route 1: Send Razorpay Key to Frontend
router.get("/get-razorpay-key", (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// ✅ Route 2: Create Order
router.post("/order", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1, // Auto capture payment
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Route 3: Verify Payment
router.post("/verify", async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const crypto = require("crypto");
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${orderId}|${paymentId}`);
        const expectedSignature = shasum.digest("hex");

        if (expectedSignature === signature) {
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
