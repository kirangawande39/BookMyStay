const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require('../models/booking');
require("dotenv").config();

const router = express.Router();

// 🟢 Create Razorpay Order
// router.post("/create-order", async (req, res) => {
//     try {
//         const {bookingId}=req.body;
//         // console.log(bookingId)
//         const booking = await Booking.findById(bookingId)
//         .populate("user", "username email")
//         .populate("listing", "title price location")
//         .exec(); // अब यह promise-based execution करेगा

//         // console.log('booking created time'+booking)
       
//         const razorpay = new Razorpay({
//             key_id: process.env.RAZORPAY_ID,
//             key_secret: process.env.RAZORPAY_SECRET,
//         });

//         const options = {
//             amount: booking.totalPrice * 100, // Amount in paise (₹5)
//             currency: "INR",
//             receipt: "order_rcptid_11",
            
//         };

//         const order = await razorpay.orders.create(options);
//         console.log("Live Order Response:", order);
//         res.json({ booking,order, key_id: process.env.RAZORPAY_KEY_ID });
//     } catch (error) {
//         console.error("Error creating Razorpay order:", error);
//         res.status(500).json({ error: "Failed to create order" });
//     }
// });

// // 🔵 Verify Payment
// router.post("/verify-payment", async (req, res) => {
//     try {
//         const { order_id, payment_id, signature } = req.body;
//         // const booking = await Booking.findById(bookingId);
//         // console.log('Booking is here'+booking)
//         if (!order_id || !payment_id || !signature) { 
//             return res.render("explore-rooms/failed", { message: "Invalid Payment Data" });
//         }
        
//         // Verify Signature
//         const secret = process.env.RAZORPAY_SECRET;
//         const hmac = crypto.createHmac("sha256", secret);
//         hmac.update(order_id + "|" + payment_id);
//         const generated_signature = hmac.digest("hex");

//         console.log(`Order_id: ${order_id}  Payment_id:${payment_id}Signature:${signature}`)

//         if (generated_signature === signature) {
//             console.log("✅ Payment Verified Successfully");
//             return res.json({ success: true});
//         } else {
//             console.log("🔴 Payment Verification Failed");
//             return res.json({ success: false });
//         }
//     } catch (error) {
//         console.error("🔴 Payment Verification Error:", error);
//         return res.json({ success: false, error: "Verification failed" });
//     }
// });










// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID, 
    key_secret: process.env.RAZORPAY_SECRET, 
});

// Create Order Route
// Create Order Route
router.post("/create-order", async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId)
            .populate("user", "username email")
            .populate("listing", "title price location");

        const options = {
            amount: booking.totalPrice * 100, // Amount in paise
            currency: "INR",
            receipt: `order_rcptid_${bookingId}`, // ✅ Valid field
        };

        const order = await razorpay.orders.create(options);
        res.json({ booking, order, key_id: process.env.RAZORPAY_ID });
    } catch (error) {
        // console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});


// Verify Payment Route
router.post("/verify-payment", async (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(order_id + "|" + payment_id)
            .digest("hex");

        if (generatedSignature) {
            // console.log("✅ Payment Verified Successfully");
            return res.json({ success: true, message: "Payment verified successfully" });
        } else {
            // console.error("❌ Payment Verification Failed: Signature mismatch");
            return res.status(400).json({ success: false, message: "Signature mismatch" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});

// Webhook for Live Payments
// router.post("/webhook", async (req, res) => {
//     const secret = process.env.RAZORPAY_SECRET;
//     const signature = req.headers["x-razorpay-signature"];
//     const body = JSON.stringify(req.body);

//     const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

//     if (expectedSignature === signature) {
//         // console.log("✅ Webhook Payment Verified:", req.body);
//         res.status(200).json({ success: true, message: "Payment verified" });
//     } else {
//         // console.error("❌ Webhook Signature Mismatch");
//         res.status(400).json({ success: false, message: "Signature mismatch" });
//     }
// });

module.exports = router;








