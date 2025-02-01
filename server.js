if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const path = require('path');
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/reviews.js")
const userRouter=require("./routes/user.js");
const bookingRoutes = require("./routes/bookings.js");




const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport=require('passport')
const LocalStatergy=require('passport-local');
const User=require("./models/user.js")

app.use(express.json());
app.use(methodOverride("_method"));
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
app.use(passport.initialize())

app.use(passport.session())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

passport.use(new LocalStatergy(User.authenticate()))


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
    await mongoose.connect(mongodb_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}
app.get("/", (req, res) => {
    res.send("I am root");
})


//set Messages middleware 
app.use((req, res, next) => {
    res.locals.successmsg = req.flash("success");
    res.locals.errormsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter)
app.use("/",userRouter)
app.use('/bookings', bookingRoutes);




app.get("/", (req, res) => {
 
    res.send("Hi, root is working");
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
    res.render("listings/error.ejs", { ErrorMsg })
    // res.status(statusCode).render("listings/error.ejs",{ErrorMsg});
})

