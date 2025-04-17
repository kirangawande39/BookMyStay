const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require('../models/booking');
const { route } = require("./listing");
require("dotenv").config();

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID, 
    key_secret: process.env.RAZORPAY_SECRET, 
});

// Create Order Route

router.post("/payment/create-order", async (req, res) => {
    try {
        const { bookingId } = req.body;
        // console.log(bookingId)
        const booking = await Booking.findById(bookingId)
            .populate("user", "username email")
            .populate("listing", "title price location");
        // console.log(booking);
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
router.post("/payment/verify-payment", async (req, res) => {
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


router.get("/payment-success", async (req, res) => {
    try {
        const { bookingId } = req.query;  
        console.log("payment success:"+bookingId)
        
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: "Paid" }, 
            { new: true } // Updated document return करेगा
        )
        .populate("user", "username email")
        .populate("listing", "title price location")
        .exec();

        if (!booking) {
            return res.status(404).send("Booking Not Found!");
        }

        res.render("explore-rooms/success.ejs", { booking });
        // res.render("explore-rooms/contact.ejs",{booking});

    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/payment-failed", (req, res) => {
    res.render("explore-rooms/failed.ejs", { message: "Your transaction could not be completed." });
});

module.exports = router;








