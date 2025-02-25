
const Booking = require('../models/booking');
const Listing = require('../models/listing');
module.exports.getBooking = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/explore-rooms');
        }

        const { startDate, endDate } = req.body;

        // ✅ Validate Dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        if (isNaN(start) || isNaN(end)) {
            req.flash('error', 'Invalid dates selected');
            return res.redirect('/explore-rooms');
        }

        if (start < today) {
            req.flash('error', 'Start date cannot be in the past');
            return res.redirect('/explore-rooms');
        }

        if (end < start) {
            req.flash('error', 'End date cannot be before the start date');
            return res.redirect('/explore-rooms');
        }

        // ✅ Ensure at least 1-day charge
        let days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) days = 1; // Minimum 1-day charge

        const totalPrice = days * listing.price;

        // ✅ Create Booking
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
        res.redirect(`/explore-rooms/${listing._id}`);
    } catch (error) {
        console.error("Error creating booking:", error);
        req.flash('error', 'Something went wrong');
        res.redirect('/explore-rooms');
    }
};


module.exports.renderBookings=async (req, res) => {
    try {
        let listingId = req.params.id;

        let singleData = await Listing.findById(listingId)
            .populate({
                path: "bookings",
                populate: { path: "user" }  
            })
            .populate("owner");

        if (!singleData) {
            req.flash("error", "Listing not found");
            return res.redirect("/explore-rooms");
        }

       

        res.render("explore-rooms/owner.ejs", { singleData });

    } catch (error) {
        console.error("Error fetching bookings:", error);
        req.flash("error", "Something went wrong");
        res.redirect("/explore-rooms");
    }
}
