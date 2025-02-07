const express = require('express');
const router = express.Router();
const wrapeAsync = require("../utils/wrapeAsync.js");
const { userLoggedIn, isOwner, validateListing } = require('../middleware.js');
const ListingController = require("../controllers/listing.js");
const {storage}=require('../cloudConfig.js')
const multer  = require('multer')

const upload = multer({ storage })

// Index route
router.route("/")
    .get(wrapeAsync(ListingController.index))
    .post(userLoggedIn,upload.single('listing[image]'),validateListing,wrapeAsync(ListingController.saveNewForm));

    // .post(upload.single("listing[image]"),(req,res)=>{
    //    res.send(req.file);
    //    console.log("file save")
    // })

    

// New route (separate for rendering the form)
router.get("/add-room", userLoggedIn, ListingController.renderNewForm);

// Individual listing routes
router.route("/:id")
    .get(wrapeAsync(ListingController.renderShowForm))
    .put(userLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapeAsync(ListingController.updateListing))
    .delete(userLoggedIn, isOwner, wrapeAsync(ListingController.deleteListing));

// Update route (separate for rendering the edit form)
router.get("/:id/edit-room", userLoggedIn, isOwner, wrapeAsync(ListingController.renderUpdateForm));

module.exports = router;
