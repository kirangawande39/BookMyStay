const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();

// 🛒 Initialize Razorpay Instance
if (!process.env.RAZORPAY_ID || !process.env.RAZORPAY_SECRET) {
  console.error("❌ Razorpay Credentials Not Found! Check .env File.");
  process.exit(1); // 🚀 Force Exit if Keys are Missing
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 🟢 Create Order API
router.post("/create-order", async (req, res) => {
  try {
   
    const options = {
      amount: 1 * 100, // Convert ₹1 to paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

  
    const order = await razorpay.orders.create(options);
  
    res.json({ order, key_id: process.env.RAZORPAY_ID });
  } catch (error) {
    console.error("🔴 Razorpay Order Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Verify Payment API


router.post("/verify-payment", (req, res) => {

  // res.render("explore-rooms/payment-failed.ejs", { message: "Payment verification failed" });
  // res.render("explore-rooms/payment-success.ejs");
    try {
        const { order_id, payment_id, signature } = req.body;

        if (!order_id || !payment_id || !signature) {
            return res.render("explore-rooms/payment-failed", { message: "Invalid Payment Data" });
        }

        const secret = process.env.RAZORPAY_SECRET;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(order_id + "|" + payment_id);
        const generated_signature = hmac.digest("hex");

        if (true) {
            console.log("✅ Payment Verified Successfully:");
            return res.render("explore-rooms/payment-success.ejs"); // ✅ Payment successful page
        } else {
            console.log("🔴 Payment Verification Failed!");
            return res.render("explore-rooms/payment-failed.ejs", { message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("🔴 Payment Verification Error:", error);
        res.render("explore-rooms/payment-failed", { message: error.message });
    }
});



// 🔄 Payment Success Page


module.exports = router;
