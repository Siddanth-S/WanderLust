const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: 600, default: Date.now } // OTP expires in 10 minutes
});

module.exports = mongoose.model("OTP", otpSchema);