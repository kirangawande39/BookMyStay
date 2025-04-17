const Listing = require('../models/listing')

const mapToken=process.env.MAP_TOKEN;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const geocodingClient = mbxGeocoding({ accessToken:mapToken});


module.exports.index = async (req, res) => {
    let alldata = await Listing.find();
    res.render("explore-rooms/index.ejs", { alldata })
}

module.exports.renderNewForm = (req, res) => {
    res.render("explore-rooms/add-room.ejs");
}

module.exports.renderShowForm = async (req, res) => {
    let { id } = req.params;
    let singleData = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");

    if (!singleData) {
        req.flash('error', ' Listing not found. Unable to delete.');
        res.redirect("/explore-rooms")
    }

    res.render("explore-rooms/show.ejs", { singleData });
}

module.exports.saveNewForm = async (req, res, next) => {

    //Giocoding  https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#geocodingv6
    let coordinate=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()
    
    let url=req.file.path;
    let filename=req.file.filename;
    console.log("Url:"+url)
    console.log("Filename:"+filename)
    let newListing = new Listing({ ...req.body.listing });
    newListing.owner = req.user._id;
    newListing.image={url,filename}
    newListing.geometry=coordinate.body.features[0].geometry

   await newListing.save()
 

    req.flash('success', 'Add Listing sucessfully!');

    res.redirect("/explore-rooms")
   
}


module.exports.renderUpdateForm = async (req, res) => {
    let { id } = req.params;
    let singleData = await Listing.findById(id)
    // singleData.topReview = singleData.reviews.sort((a, b) => b.rating - a.rating)[0];
    if (!singleData) {
        req.flash('error', ' Listing not found. Unable to delete.');
        res.redirect("/explore-rooms")
    }
    
    let originalImageUrl=singleData.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_100,w_200/e_blur:150");
    res.render("explore-rooms/edit.ejs", { singleData,originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
   let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename}
        await listing.save()
    }

    req.flash('success', 'Update Listing sucessfully!');
    res.redirect(`/explore-rooms/${id}`)
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedData = await Listing.findByIdAndDelete(id);
    req.flash('success', 'Delete Listing sucessfully!');

    res.redirect("/explore-rooms");
}