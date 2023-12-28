/**
 * MVC : Model(DB), View(Frontend), Controller(Backend)
 * Implement Design Pattern for Listings
 */
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.indexRoute = async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.newRoute = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createRoute = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.showRoute = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you request for does not exist");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.editRoute = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you request for edit does not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/c_thumb,g_face,h_200,w_200/r_max/f_auto");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateRoute = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },  // deconstructing the JS Object
        { runValidators: true, new: true }
    );

    // in case edit route get new image to be uploaded then 
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
    // console.log(updatedList.title);
};

module.exports.deleteRoute = async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}