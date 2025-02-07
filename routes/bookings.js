const express = require('express');
const router = express.Router();
const wrapeAsync = require("../utils/wrapeAsync.js");
const { userLoggedIn } = require('../middleware.js');
const BookingControllers = require("../controllers/bookings.js");
const Booking = require('../models/booking.js');

router.route('/:id/book')
    .post(userLoggedIn, wrapeAsync(BookingControllers.getBooking));


router.route('/:id')
    .get(userLoggedIn, wrapeAsync(BookingControllers.renderBookings));



module.exports = router;