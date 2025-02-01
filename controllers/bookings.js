
const Booking = require('../models/booking');
const Listing = require('../models/listing');
module.exports.getBooking = async (req, res) => {
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
}

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
            return res.redirect("/listings");
        }

       

        res.render("listings/owner.ejs", { singleData });

    } catch (error) {
        console.error("Error fetching bookings:", error);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
}
