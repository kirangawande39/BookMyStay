const { model } = require("mongoose");
const User = require("../models/user.js");


module.exports.renderSignupForm=(req, res) => {
    res.render("./users/singup.ejs");
}

module.exports.saveSingupForm=async (req, res,next) => {
    try {

        let { email, username, password } = req.body;
        let newUser = new User({
            email: email,
            username: username,
        })

        let registerUser = await User.register(newUser, password);
        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash('success', 'Welcome to Wanderlust!')
            res.redirect("/listings");
        })
    }
    catch (err) {
        req.flash("error", err.message)
        res.redirect("/signup")
    }
}

module.exports.renderLoginForm=(req, res) => {
    res.render("./users/login.ejs");
}

module.exports.checkLoginAuthintication=async (req, res) => {
    req.flash("success","Login Sucessfully");
    let redirectUrl=res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
 }


 module.exports.LogoutUser=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","logged you out!");
        res.redirect("/listings");
    });
}


