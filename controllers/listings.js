const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const { name } = req.query;
  const {filter}=req.query;
  let allListings = await Listing.find({});
  if (filter) {
    allListings = allListings.filter(listing => listing.category.includes(filter));
  }
  res.render("listings/index.ejs", { allListings ,name,filter});
};

module.exports.renderNewForm = (req, res) => {
  res.locals.hideSearch=true;
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  res.locals.hideSearch=true;
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
  };
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  res.locals.hideSearch=true;
  let { id } = req.params;
  let listing = await Listing.findById(id);
  console.log(listing);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  let originalUrl = listing.image.url;
  originalUrl= originalUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing,originalUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  if (!req.body.listing) {
    throw new ExpressError(400, "Send Valid data for listing");
  }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //spread operator(...) spreads the key-value pair to new object
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};
