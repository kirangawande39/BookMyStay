const express=require('express')
const router=express.Router({mergeParams:true});
const wrapeAsync = require("../utils/wrapeAsync.js")
const {validateReview,userLoggedIn,isreviewAuthor}=require('../middleware.js')

const ListingController=require("../controllers/review.js")



//Review Route

router.post("/",userLoggedIn, validateReview, wrapeAsync(ListingController.createReview))


// Review delete route
router.delete("/:reviewId",userLoggedIn,isreviewAuthor, wrapeAsync(ListingController.deleteReview))



module.exports=router;