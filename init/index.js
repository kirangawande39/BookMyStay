const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");


// const mongodburl = 'mongodb://127.0.0.1:27017/restro_book';
let url=process.env.MONGODB_URL;

Main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(`Error: ${err}`)
    })

async function Main() {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}
const initDB = async ()=>{
    initData.data=initData.data.map((obj)=>({
       ...obj,
       owner:"676e317d0b648bf3e1167470",
    }));
    await Listing.insertMany(initData.data);
    console.log("data initialize..");
}

initDB();

// const deleteData=async()=>{
    
//     await Listing.deleteMany();
// }
// deleteData()