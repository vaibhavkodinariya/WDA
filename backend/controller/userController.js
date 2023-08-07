const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcry = require("bcrypt");
const fs = require("fs");
const multer = require("multer");
const storage = require("node-persist");
const delay = 2 * 60 * 1000;
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
// const path = require("path");
const speakeasy = require("speakeasy");

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./images");
  },
  filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    return cb(null, file.originalname);
  },
});

const upload = multer({ storage: imageStorage });

//@desc Login user
//@Route /api/user/login
//access Private
const userLogin = asyncHandler(async (req, res) => {
  const { contactNumber, password, type } = req.body;

  if (!contactNumber || !password || !type) {
    res.status(400);
    res.send(
      res.json({ success: false, messege: "Please fill your Credentails" })
    );
  }
  const userdata = await User.findOne({ ContactNo: contactNumber });
  if (userdata && (await bcry.compare(password, userdata.Password))) {
    if (type == "Admin") {
      res.status(200).json({
        Success: true,
      });
    } else {
      res.status(200).json({
        Success: true,
        name: userdata,
      });
    }
  } else {
    res.status(400);
    res.json({ success: false, messege: "Incorrect Username or Password" });
  }
});

//@desc Register user
//@Route /api/user/verify
//access Private
const sendOtp = asyncHandler(async (req, res) => {
  const { name, type, contactNo } = req.body;
  if (!name || !type || !contactNo) {
    res.send(
      res.json({
        success: false,
        messege: "Please Enter your Number Properly",
      })
    );
  }

  const data = await User.findOne({ ContactNo: contactNo });

  if (data) {
    res.send({ success: false, messege: "Already Registered Number" });
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
          messege: "OTP has been Send To Your Entered Number",
        })
      )
      .catch((error) => {
        res.send({ success: false, messege: "Something Went Wrong" });
      });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otpCode, name } = req.body;
  if (!otpCode) {
    res.send({ success: false, messege: "Send OTP Properly" });
  } else {
    try {
      const data = await storage.getItem(name);
      if (data["otp"] == otpCode) {
        res.send({ success: true, messege: "Otp Verified" });
      } else {
        res.send({ success: false, messege: "Wrong OTP Please Try Again" });
      }
    } catch (e) {
      res.send({ success: false, messege: "Otp Expired Resend Again" });
    }
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, password, confirmpassword } = req.body;
  if (!password || !confirmpassword) {
    res.send({ success: false, messege: "Please Enter Password Properly" });
  } else {
    if (password != confirmpassword) {
      res.send({
        success: false,
        messege: "Password and ConfirmPassword Doesn't Match",
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
        res.status(400);
        throw new Error("Invalid User Data");
      }
    }
  }
});

//@desc Add Business Images
//@Route /api/user/
//access Private
const addImages = asyncHandler(async (req, res) => {
  const { imagePath } = req.body;
  const imageBuffer = Buffer.from(imagePath, "base64");

  let currentDirectory = process.cwd();

  currentDirectory = currentDirectory.replace(/\\/g, "/");

  console.log("Current directory path:", currentDirectory);

  var folderpath = `${currentDirectory}/businessImages`;

  fs.writeFile(`${folderpath}/vaibhav.jpg`, imageBuffer, (err) => {
    if (err) {
      return res.status(500).send("Error saving image");
    }
  });
});

module.exports = { userLogin, sendOtp, addImages, verifyOtp, registerUser };
