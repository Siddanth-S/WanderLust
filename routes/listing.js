const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer = require("multer");
const UserController = require("../controllers/users.js");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

//index and create route
router
  .route("/profile")
  .get((req, res) => {
    res.render("../views/listings/profile.ejs", {
      CurrentUser: req.user,
      hideSearch: true,
    });
  })
  .post(isLoggedIn, UserController.passwordAndUsername);

router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.createListing)
  );

//new list route
router.get("/new", isLoggedIn, ListingController.renderNewForm);

//show route,update route,delete route
router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    ListingController.updateListing,
    validateListing,
    wrapAsync(ListingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, ListingController.renderEditForm);

module.exports = router;
