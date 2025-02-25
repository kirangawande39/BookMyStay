const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require('../models/booking');
require("dotenv").config();

const router = express.Router();

// 🟢 Create Razorpay Order
router.post("/create-order", async (req, res) => {
    try {
        const {bookingId}=req.body;
        // console.log(bookingId)
        const booking = await Booking.findById(bookingId)
        .populate("user", "username email")
        .populate("listing", "title price location")
        .exec(); // अब यह promise-based execution करेगा

        // console.log('Booking is here'+booking)
       
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: booking.totalPrice * 100, // Amount in paise (₹5)
            currency: "INR",
            receipt: "order_rcptid_11",
            
        };

        const order = await razorpay.orders.create(options);
        res.json({ booking,order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// 🔵 Verify Payment
router.post("/verify-payment", async (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        // const booking = await Booking.findById(bookingId);

        // console.log('Booking is here'+booking)
        if (!order_id || !payment_id || !signature) {
            return res.render("explore-rooms/failed", { message: "Invalid Payment Data" });
        }

        // Verify Signature
        const secret = process.env.RAZORPAY_SECRET;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(order_id + "|" + payment_id);
        const generated_signature = hmac.digest("hex");

        if (generated_signature === signature) {
            // console.log("✅ Payment Verified Successfully");
            return res.json({ success: true});
        } else {
            // console.log("🔴 Payment Verification Failed");
            return res.json({ success: false });
        }
    } catch (error) {
        console.error("🔴 Payment Verification Error:", error);
        return res.json({ success: false, error: "Verification failed" });
    }
});

module.exports = router;
