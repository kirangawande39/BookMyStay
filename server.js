if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

// Importing Express to create an HTTP server.
const express = require('express'); 

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
app.use('/bookings', bookingRoutes);
// app.use("/", paymentRoutes);

app.use("/payment", paymentRoutes);


app.get("/payment-success", async (req, res) => {
    try {
        const { bookingId } = req.query;  
        console.log("payment success:"+bookingId)
        // Booking को Find करके Status को "Paid" में Update करो
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: "Paid" }, // अपडेट फील्ड
            { new: true } // Updated document return करेगा
        )
        .populate("user", "username email")
        .populate("listing", "title price location")
        .exec();

        if (!booking) {
            return res.status(404).send("Booking Not Found!");
        }

        res.render("explore-rooms/success.ejs", { booking });

    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/owner/verify-booking", async (req, res) => {
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
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
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
});



app.get("/payment-failed", (req, res) => {
    res.render("explore-rooms/failed.ejs", { message: "Your transaction could not be completed." });
});
app.get("/", (req, res) => {
 
    res.redirect('explore-rooms')
})
// app.post("/bookings/:id/book",(req,res)=>{
//     console.log("I am bookings");
//     console.log(req.params.id)
// })
app.get("/mybookings", async (req, res) => {
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
});


app.post('/update-booking/:id', async (req, res) => {
    const { status } = req.body;
    await Booking.updateOne({ _id: req.params.id }, { $set: { status } });
    res.redirect('back'); // Same page pe redirect hoga
});

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

app.listen(port, () => {
    console.log(`Listining port is ${port}`);
})


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

