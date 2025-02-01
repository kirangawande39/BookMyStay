const express = require('express');
const router = express.Router();
const { userLoggedIn } = require('../middleware.js');
const BookingControllers = require("../controllers/bookings.js");

router.route('/:id/book')
    .post(userLoggedIn, BookingControllers.getBooking);


router.route('/:id')
    .get(BookingControllers.renderBookings);

module.exports = router;