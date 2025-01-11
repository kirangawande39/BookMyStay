const Review = require('../models/review.js')
const Listing = require('../models/listing.js');
const { model } = require('mongoose');


module.exports.createReview=async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    let newReview = await Review(req.body.review);
    newReview.author=req.user._id;
    // console.log(newReview)
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash('success', 'Add Review Sucessfully!');
    
    res.redirect(`/listings/${req.params.id}`)

}

module.exports.deleteReview=async(req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Delete Review Sucessfully!');
    res.redirect(`/listings/${id}`)
}