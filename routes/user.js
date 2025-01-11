const express = require('express')
const router = express.Router({ mergeParams: true });

const wrapeAsync = require('../utils/wrapeAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

const ListingController=require("../controllers/user.js")


router.route("/signup")
.get(ListingController.renderSignupForm)

.post(wrapeAsync(ListingController.saveSingupForm))

router.route("/login")
.get(ListingController.renderLoginForm)

.post(saveRedirectUrl,
     passport.authenticate("local", {
   
    failureRedirect:"/login",
    failureFlash:true,
}),
 ListingController.checkLoginAuthintication);


 
// passport logout user
router.get("/logout",ListingController.LogoutUser);




module.exports = router;