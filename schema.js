const joi=require('joi')


module.exports.listingSchema=joi.object({
        listing:joi.object({

            title:joi.string().required(),
            description:joi.string().required(),
            country:joi.string().required(),
            location:joi.string().required(),
            price:joi.number().required().min(0),
      } ).required()
    
})

module.exports.reviewSchema=joi.object({
      review:joi.object({
       rating:joi.string().required().min(1).max(5),
       comment:joi.string().required(),
      }).required()
})





module.exports.bookingSchema= joi.object({
    user: joi.string().hex().length(24).required(),  // MongoDB ObjectId validation
    listing: joi.string().hex().length(24).required(),
    startDate: joi.date().iso().required(),
    endDate: joi.date().iso().greater(joi.ref('startDate')).required(), // End date must be after start date
    totalPrice: joi.number().positive().required(),
    status: joi.string().valid("Pending", "Confirmed", "Cancelled").default("Pending")
});


