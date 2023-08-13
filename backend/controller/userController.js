const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcry = require("bcrypt");
const storage = require("node-persist");
const delay = 2 * 60 * 1000;
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const speakeasy = require("speakeasy");

//@desc Login user
//@Route /api/user/login
//access Private
const userLogin = asyncHandler(async (req, res) => {
  const { contactNumber, password, type } = req.body;

  if (!contactNumber || !password || !type) {
    res.send(
      res.json({ success: false, message: "Please fill your Credentails" })
    );
  }
  const userdata = await User.findOne({ ContactNo: contactNumber });
  if (userdata && (await bcry.compare(password, userdata.Password))) {
    if (type == "Admin") {
      res.send({
        success: true,
      });
    } else {
      res.send({
        success: true,
        name: userdata,
      });
    }
  } else {
    res.send({ success: false, message: "Incorrect Username or Password" });
  }
});

//@desc Register user
//@Route /api/user/verify
//access Private
const sendOtp = asyncHandler(async (req, res) => {
  const { name, type, contactNo } = req.body;
  if (!name || !type || !contactNo) {
    return res.send({
      success: false,
      message: "Please Enter your Number Properly",
    });
  }

  const data = await User.findOne({ ContactNo: contactNo });

  if (data) {
    res.send({ success: false, message: "Already Registered Number" });
  } else {
    const secret = speakeasy.generateSecret({ length: 20 }); // Generate a secret key
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    await storage.init({
      dir: "tempData",
      stringify: JSON.stringify,
      parse: JSON.parse,
      writeQueue: true,
      writeQueueWriteOnlyLast: true,
      expiredInterval: 2 * 60 * 1000,
    });
    const mergedData = {
      otp: otp,
      data: req.body,
    };
    await storage.setItem(name, mergedData);
    setTimeout(() => {
      storage.removeItem(name);
    }, delay);

    await client.messages
      .create({
        body:
          otp +
          " is your OTP to login to WDA. Do not share with anyone. WDA never calls to ask for OTP. The OTP expires in 2 mins.",
        to: "+91" + contactNo,
        from: "+16672819468",
      })
      .then(() =>
        res.send({
          success: true,
          message: "OTP has been Send To Your Entered Number",
        })
      )
      .catch((error) => {
        res.send({ success: false, message: "Something Went Wrong" });
      });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otpCode, name } = req.body;
  if (!otpCode) {
    res.send({ success: false, message: "Send OTP Properly" });
  } else {
    try {
      const data = await storage.getItem(name);
      if (data["otp"] == otpCode) {
        res.send({ success: true, message: "Otp Verified" });
      } else {
        res.send({ success: false, message: "Wrong OTP Please Try Again" });
      }
    } catch (e) {
      res.send({ success: false, message: "Otp Expired Resend Again" });
    }
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, password, confirmpassword } = req.body;
  if (!password || !confirmpassword) {
    res.send({ success: false, message: "Please Enter Password Properly" });
  } else {
    if (password != confirmpassword) {
      res.send({
        success: false,
        message: "Password and ConfirmPassword Doesn't Match",
      });
    } else {
      const salt = await bcry.genSalt(10);
      const hashpassword = await bcry.hash(password, salt);
      const data = await storage.getItem(name);
      const userdata = await User.create({
        Name: data["data"]["name"],
        Type: data["data"]["type"],
        ContactNo: data["data"]["contactNo"],
        Password: hashpassword,
      });
      if (userdata) {
        res.send(
          res.json({
            success: true,
          })
        );
      } else {
        res.send({ success: false, message: "Invalid User Data" });
      }
    }
  }
});

module.exports = { userLogin, sendOtp, verifyOtp, registerUser };
