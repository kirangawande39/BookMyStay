const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware');

// POST route to create a booking
router.post('/:id/book', isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const { startDate, endDate } = req.body;
    
    // Calculate total price (assuming per-day pricing)
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = days * listing.price;

    const booking = new Booking({
        user: req.user._id,
        listing: listing._id,
        startDate,
        endDate,
        totalPrice
    });

    await booking.save();
    req.flash('success', 'Book sucessfully');
    res.redirect(`/listings/${listing._id}`);
});

module.exports = router;
