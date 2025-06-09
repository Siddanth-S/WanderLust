const User = require("../models/user");
const OTP = require("../models/otp");

module.exports.renderSignupForm = (req, res) => {
  res.locals.hideSearch = true;
  res.render("users/signup.ejs");
};
module.exports.renderLoginForm = (req, res) => {
  res.locals.hideSearch = true;
  res.render("users/login.ejs");
};

module.exports.passwordAndUsername=async (req, res,next) => {
  const { username, email } = req.body.profile;
  const password=req.body.profile.password
  const confirmPassword=req.body.profile.confirmPassword;
  console.log(confirmPassword);
  const user = req.user;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      req.flash("error", "Email is already in use by another account.");
      return res.redirect("/listings/profile");
    }

    const existingUserwithusername = await User.findOne({ username });
    if (existingUserwithusername && existingUserwithusername._id.toString() !== user._id.toString()) {
      req.flash("error", "Username is already in use by another account.");
      return res.redirect("/listings/profile");
    }

    user.username = username;
    user.email = email; 
    await user.save();
    
  
    if (password && password.trim() !== "") {
      
      await new Promise((resolve, reject) => {
        user.setPassword(password, async (err) => {
          if (err) return reject(err);
          await user.save();
          resolve();
        });
      });
    }
  
    await new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  
    req.flash("success", "Profile updated successfully.");
    res.redirect("/listings/profile");
  } catch (e) {
    next(e);
  }

  
};

module.exports.signup = async (req, res, next) => {
  const { username, email, password, otp } = req.body;

  // Step 1: Check if OTP exists in DB
  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord) {
    req.flash("error", "No OTP found for this email. Please request one.");
    return res.redirect("/signup");
  }

  // Step 2: Compare entered OTP
  if (otpRecord.otp !== otp) {
    req.flash("error", "Invalid or expired OTP.");
    return res.redirect("/signup");
  }

  // Step 3: OTP is correct — register the user
  const user = new User({ username, email });
  const registeredUser = await User.register(user, password);

  // Step 4: Log in the user
  req.login(registeredUser, (err) => {
    if (err) return next(err);
    req.flash("success", "Welcome to Wanderlust!");
    res.redirect("/listings");
  });

  // Step 5: Delete OTP after successful use
  await OTP.deleteOne({ email });
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are Logged out!");
    res.redirect("/listings");
  });
};
