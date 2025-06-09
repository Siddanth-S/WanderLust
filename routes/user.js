const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const UserController = require("../controllers/users.js");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const OTP = require("../models/otp"); 
const Otpvalidaiton=require("../controllers/otp.js")

//otp
router.post("/send-otp", Otpvalidaiton.otp);

//signup
router
  .route("/signup")
  .get(UserController.renderSignupForm)
  .post(wrapAsync(UserController.signup));

//login
router
  .route("/login")
  .get(UserController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserController.login
  );

//logout
router.get("/logout", UserController.logOut);

module.exports = router;
