const express = require('express');
const router = express.Router();
const wrapeAsync = require("../utils/wrapeAsync.js");
const { userLoggedIn, validateBooking } = require('../middleware.js');
const BookingControllers = require("../controllers/bookings.js");
const Booking=require("../models/booking.js")

// router.route('/:id/book')
//     .post(userLoggedIn,validateBooking, wrapeAsync(BookingControllers.getBooking));

router.route('/bookings/:id/book')
    .post(userLoggedIn, wrapeAsync(BookingControllers.getBooking));


router.route('/bookings/:id')
    .get(userLoggedIn, wrapeAsync(BookingControllers.renderBookings));

router.route("/owner/verify-booking")
    .get(userLoggedIn, wrapeAsync(BookingControllers.bookingverifyresponse));


router.route("/mybookings")
    .get(userLoggedIn, wrapeAsync(BookingControllers.renderuserbookings));
    
router.post('/update-booking/:id', userLoggedIn, async (req, res) => {
    const { status } = req.body;
    // console.log("Status:"+status)
    await Booking.updateOne({ _id: req.params.id }, { $set: { status } });
    res.redirect('back'); // Same page pe redirect hoga
});

module.exports = router;