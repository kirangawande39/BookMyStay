const express = require('express')
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser')
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path')


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOption = {
    secret: "musupersecretcode",
    resave: false,
    saveUninitialized: true,
}

// app.use(cookieParser("secretcode"));
app.use(session(sessionOption))
app.use(flash())

//set Messages middleware 
app.use((req, res, next) => {
    res.locals.successmsg = req.flash("success");
    res.locals.errormsg = req.flash("error");
    next();
})

app.get("/register", (req, res) => {
    let { name = "kiran" } = req.query;
    req.session.name = name;
    if (name === "kiran") {

        req.flash('error', 'User not register');
    }
    else {
        req.flash('success', 'User register sucessfully....');

    }

    res.redirect("/hello");
})

app.get("/hello", (req, res) => {
    res.render("page.ejs", { name: req.session.name })
})



// app.get("/reqcount", (req, res) => {
//     if(req.session.count){
//         req.session.count++;
//     }
//     else{
//         req.session.count=1;
//     }
//     res.send(`you senta request ${req.session.count} time`);
// })

// //sending cookies
// app.get("/setcookies",(req,res)=>{
//     res.cookie("name","kiran");
//     res.cookie("Madein","India");
//     res.send("we send you a cookes");
// })

// //cookie parser isme koi bhi change kar sakta hai ye secure nahi hai
// app.get("/getcookies",(req,res)=>{
//    let {name="butkya"}=req.cookies;
//    res.send(`Hi , ${name}`);
//    console.log(req.cookies)
// })

// //secure cookies & send siingd cookies
// app.get("/getsignedcookie",(req,res)=>{
//     res.cookie("color","red",{signed:true});
//     res.send("done!")
// })

// app.get("/verify",(req,res)=>{
//     console.log(req.signedCookies);
//     res.send("veriry");
// })



app.listen(port, () => {
    console.log(`Listining port is ${port}`);
})
