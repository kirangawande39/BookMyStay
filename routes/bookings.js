const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware'); // Ensure this middleware exists

// POST route to create a booking
router.post('/:id/book', isLoggedIn, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }

        const { startDate, endDate } = req.body;

        // Calculate total price
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
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
