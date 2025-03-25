
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


module.exports.renderBookings = async (req, res) => {
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


module.exports.bookingverifyresponse = async (req, res) => {
    try {
        const { bookingId } = req.query;
        const booking = await Booking.findById(bookingId)
            .populate("user", "username")
            .populate("listing", "title");

        if (booking) {
            res.send(`
                    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f4;">
                        <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px;">
                            <h2 style="color: green;">✅ Booking Verified</h2>
                            <p><strong>User:</strong> ${booking.user.username}</p>
                            <p><strong>Booking Status:</strong> ${booking.status}</p>
                            <p><strong>Property:</strong> ${booking.listing.title}</p>
                            <p><strong>Dates:</strong> ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</p>
                            <button onclick="window.history.back()" style="background: #007bff; color: white; border: none; padding: 10px 20px; margin-top: 15px; border-radius: 5px; cursor: pointer; font-size: 16px;">⬅️ Back</button>
                        </div>
                    </div>
                `);
        } else {
            res.send(`
                    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f4;">
                        <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px;">
                            <h2 style="color: red;">❌ No Booking Found</h2>
                            <button onclick="window.history.back()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; margin-top: 15px; border-radius: 5px; cursor: pointer; font-size: 16px;">⬅️ Back</button>
                        </div>
                    </div>
                `);
        }
    } catch (error) {
        res.status(500).send(`
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f4;">
                    <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px;">
                        <h2 style="color: red;">⚠️ Error Occurred</h2>
                        <p>${error.message}</p>
                        <button onclick="window.history.back()" style="background: #ffc107; color: black; border: none; padding: 10px 20px; margin-top: 15px; border-radius: 5px; cursor: pointer; font-size: 16px;">⬅️ Back</button>
                    </div>
                </div>
            `);
    }
}


module.exports.renderuserbookings = async (req, res) => {
    try {
        // If user is not logged in, redirect to login page
        if (!req.user) {
            return res.redirect("/login");
        }



        // Fetch bookings where user matches the logged-in user's ID
        const userBookings = await Booking.find({ user: req.user.id })
            .populate("listing") // Populate listing details
            .exec();



        if (userBookings.length === 0) {
            req.flash("error", "No bookings found for this user.");
            return res.redirect("/explore-rooms"); // Redirecting to bookings page
        }


        // Render EJS page with the bookings and user details
        res.render("explore-rooms/userbookings.ejs", { bookings: userBookings, user: req.user });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send("Server Error");
    }
}