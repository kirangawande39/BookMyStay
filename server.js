if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

// Importing Express to create an HTTP server.
const express = require('express'); 


const crypto = require("crypto");
// Importing Mongoose to connect with MongoDB.
const mongoose = require('mongoose'); 
const razorpay=require('razorpay')
const app = express();
const port = 3000; 
const path = require('path'); 
const methodOverride = require("method-override"); 
const ejsMate = require("ejs-mate");

 // Custom error handling class for managing application errors.
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js"); 
const reviewsRouter = require("./routes/reviews.js"); 
const userRouter = require("./routes/user.js"); 
const bookingRoutes = require("./routes/bookings.js"); 
const Booking = require('./models/booking'); 

const paymentRoutes = require("./routes/payment.js");
const session = require('express-session'); 
const MongoStore = require('connect-mongo'); // Using MongoDB to store session data.
const flash = require('connect-flash'); 
const passport = require('passport'); // Passport.js for user authentication.
const LocalStrategy = require('passport-local'); // Local authentication strategy for Passport.
const User = require("./models/user.js");
app.use(express.json()); // Middleware to parse incoming JSON data from requests.
app.use(methodOverride("_method")); // Enables method override, allowing forms to use PUT and DELETE requests.



// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }))
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

let mongodb_url=process.env.MONGODB_URL;

const store=MongoStore.create({
    mongoUrl:mongodb_url,
    crypto: {
        secret: process.env.SECRET,
      },
      touchAfter: 24 * 3600,
  })

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expire:Date.now()+ 7 * 24*60*60*1000,
        maxAge:7 * 24*60*60*1000,
        httpOnly:true,
    }
    
}

app.use(session(sessionOption))
app.use(flash())

// A middleware that initialize password
// Initializes Passport for authentication handling.
app.use(passport.initialize());

// Enables persistent login sessions, allowing users to stay logged in across requests.
app.use(passport.session());

// Serializes user data to store in the session (converts user object to session ID).
passport.serializeUser(User.serializeUser()); 

// Deserializes user data (retrieves user details from session ID).
passport.deserializeUser(User.deserializeUser()); 

// Configures Passport to use the local strategy for username/password authentication.
passport.use(new LocalStrategy(User.authenticate())); 



// app.get("/registerUser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"kiran12@gmail.com",
//     username:"king123",
//   })

//   let newUser=await User.register(fakeUser,"password");
//   res.send(newUser);
// })


// const mongodburl = 'mongodb://127.0.0.1:27017/restro_book';


Main()
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(`Error: ${err}`)
})

async function Main() {
    await mongoose.connect(mongodb_url)
}


//set Messages middleware 
app.use((req, res, next) => {
    res.locals.successmsg = req.flash("success");
    res.locals.errormsg = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.RAZORPAY_ID = process.env.RAZORPAY_ID;
    next();
})

app.use("/explore-rooms",listingsRouter);
app.use("/explore-rooms/:id/reviews",reviewsRouter)
app.use("/",userRouter)
app.use('/', bookingRoutes);
// app.use("/", paymentRoutes);

app.use("/", paymentRoutes);









app.get("/", (req, res) => {
 
    res.redirect('explore-rooms')
})
// app.post("/bookings/:id/book",(req,res)=>{
//     console.log("I am bookings");
//     console.log(req.params.id)
// })





// app.get("/payment", (req, res) => {
//     // console.log("hello i am payment page")
//     res.render("explore-rooms/payment.ejs");
// });


app.get("/privacy",(req,res)=>{
    res.render("explore-rooms/privacy.ejs");
})
app.get("/terms",(req,res)=>{
    res.render("explore-rooms/terms.ejs");
})


app.post("/send-otp", async (req, res) => {
  const { email, username, password } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email, username, password }); // hash password later
  }

  user.otp = otp;
  user.otpExpiration = otpExpiration;
  await user.save();

  // Respond to frontend to trigger EmailJS
  res.json({ success: true, otp }); // Don't send this in production!
});


app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiration < Date.now()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiration = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully!" });
});


  


//Not Existing route Error
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"))
})

// Middleware error handaler
app.use((err, req, res, next) => {
    let { statusCode = 500, ErrorMsg = "Smothing went wrong!" } = err;
    res.render("explore-rooms/error.ejs", { ErrorMsg })
    // res.status(statusCode).render("explore-rooms/error.ejs",{ErrorMsg});
})


app.listen(port, () => {
    console.log(`Listining port is ${port}`);
})