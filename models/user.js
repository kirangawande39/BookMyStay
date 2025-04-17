

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: String,
    otpExpiration: Date,
    isVerified: {
        type: Boolean,
        default: false
    }


});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);

