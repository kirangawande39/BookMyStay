const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();
const router = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Payment Order Create API
router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 1 * 100, // Amount in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // res.json(order);
    console.log(order)
    res.render('listings/payment.ejs', {order})
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// router.post("/razorpay-webhook", (req, res) => {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
//     const crypto = require("crypto");
//     const shasum = crypto.createHmac("sha256", secret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");
  
//     if (digest === req.headers["x-razorpay-signature"]) {
//       console.log("Payment Verified:", req.body);
//       res.json({ status: "ok" });
//     } else {
//       res.status(400).json({ error: "Invalid signature" });
//     }
//   });


  router.get("/payment-success", (req, res) => {
    res.render("listings/success", { message: "Your payment was successful!" });
});





  
module.exports = router;
