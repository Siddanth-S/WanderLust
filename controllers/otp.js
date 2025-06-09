
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const OTP = require("../models/otp"); 


module.exports.otp=async (req, res) => {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
  
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });
  
    // Save OTP to DB (update if exists)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    );
  
    // Send OTP via email using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // your App password
      },
    });
  
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Wanderlust Signup",
      text: `Your OTP is: ${otp}`,
    });
  
    res.json({ success: true });
  };