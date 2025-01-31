const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware');

// POST route to create a booking
router.post('/:id/book', isLoggedIn, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }

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

        // ✅ Step 1: Push booking ID to listing's bookings array
        listing.bookings.push(booking._id);
        await listing.save(); // ✅ Step 2: Save the updated listing

        req.flash('success', 'Booking successful');
        res.redirect(`/listings/${listing._id}`);
    } catch (error) {
        console.error("Error creating booking:", error);
        req.flash('error', 'Something went wrong');
        res.redirect('/listings');
    }
});

module.exports = router;

