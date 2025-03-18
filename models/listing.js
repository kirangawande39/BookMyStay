const mongoose=require('mongoose');
const Review=require("./review.js")


const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,     
    },
    description:String,
    image:{
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
   
    
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry: {
        type: {
          type: String, // Dont do `{ location: { type: String } }`
          enum: ['Point'], // location.type must be Point
          required: true
        },
        coordinates: {
          type: [Number],
          default:[76.1842,20.5292], // buldhana langtitue and latitute
          required: true
        }
      },
      
      bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Booking",
        }
    ],
    
});


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;