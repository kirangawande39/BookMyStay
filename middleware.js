
const Listing=require("./models/listing")
const Review=require("./models/review")
const { listingSchema } = require("./schema.js")
const ExpressError = require("./utils/ExpressError.js")
const { reviewSchema } = require("./schema.js")

//check use Login 
module.exports.userLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create new listing")
        return res.redirect("/login")
    }
    next();
}


//save originalUrl user
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next()
}

//Authorization 
module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);

    if(!listing.owner.equals(res.locals.currUser._id)){
         req.flash("error","You are not authorized. You do not have permission to access this resource!")
         return res.redirect("/listings")
    }
    next()
}


// Listing Validation Middleware 
 module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        throw new ExpressError(400, errorMessage);
    }
    else {
        next();
    }
}



// Review Validation Middleware 
 module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        throw new ExpressError(400, errorMessage);
    }
    else {
        next();
    }
}

//Authorization 
module.exports.isreviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);

    if(!review.author.equals(res.locals.currUser._id)){
         req.flash("error","You are not authorized to perform this action. You do not have permission to delete this review.")
         return res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
};



