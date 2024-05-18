const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcry = require("bcrypt");
const fs = require("fs");
const path = require("path");
const storage = require("node-persist");
const Website = require("../models/websiteModel");
const Query = require("../models/queryModel");
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
  try {
    if (!contactNumber || !password || !type) {
      return res.status(400).send({
        message: "Please fill your Credentails",
      });
    }
    const userdata = await User.findOne({ ContactNo: contactNumber });
    if (userdata && (await bcry.compare(password, userdata.Password))) {
      return type == "admin"
        ? res.status(200).send({
            userId: userdata._id,
          })
        : res.status(200).send({
            userID: userdata._id,
            Name: userdata.Name,
            ContactNo: userdata.ContactNo,
          });
    }
    return res.status(400).send({ message: "Incorrect Username or Password" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc Valided user
//@Route /api/user/validedDomain
//access Private
const validedDomain = asyncHandler(async (req, res) => {
  const { domain } = req.params;
  try {
    if (!domain)
      return res.status(400).send({ message: "Please fill your Credentails" });
    const validedDomain = domain.replace(/\s+/g, "");
    const isValid = await Website.findOne({
      domainName: `${validedDomain}.html`,
    });
    if (isValid) return res.status(200).send({ message: "WebSite Exists" });
    return res.status(400).send({ message: "WebSite Not Exists" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc Register user
//@Route /api/user/verify
//access Private
const sendOtp = asyncHandler(async (req, res) => {
  const { name, type, contactNo } = req.body;
  try {
    if (!name || !type || !contactNo) {
      return res.status(400).send({
        message: "Please Enter your Details Properly",
      });
    }
    const data = await User.findOne({ ContactNo: contactNo });
    if (data)
      return res.status(400).send({ message: "Already Registered Number" });

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
        res.status(200).send({
          message: "OTP has been Send To Your Entered Number",
        })
      )
      .catch((error) => {
        res.status(400).send({ message: error.message });
      });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc User Registeration
//@Route /api/user/verifyOtp
//access Private
const verifyOtp = asyncHandler(async (req, res) => {
  const { otpCode, name } = req.body;
  if (!otpCode) return res.status(400).send({ message: "Send OTP Properly" });
  try {
    const data = await storage.getItem(name);
    if (data["otp"] == otpCode)
      return res.status(200).send({ success: true, message: "Otp Verified" });
    return res.status(400).send({ message: "Wrong OTP Please Try Again" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc User Registeration
//@Route /api/user/registerUser
//access Private
const registerUser = asyncHandler(async (req, res) => {
  const { name, password, confirmpassword } = req.body;
  try {
    if (!password || !confirmpassword) {
      return res.status(400).send({
        message: "Please Enter Password or ConfirmPassword Properly",
      });
    }
    if (password != confirmpassword) {
      return res.status(400).send({
        message: "Password and ConfirmPassword Doesn't Match",
      });
    }
    const salt = await bcry.genSalt(10);
    const hashpassword = await bcry.hash(password, salt);
    // const data = await storage.getItem(name);
    const userdata = await User.create({
      Name: name,
      Type: "user",
      ContactNo: 8155801818,
      Password: hashpassword,
    });
    if (userdata) return res.sendStatus(201);
    return res.status(400).send({ message: "Invalid User Data" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc Update User Profile
//@Route /api/user/updateUserProfile
//access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const {
    name,
    gender,
    contactNumber,
    dob,
    address,
    city,
    state,
    pincode,
    profileImagePath,
  } = req.body;
  try {
    const dataProfile = await User.findOne({ ContactNo: contactNumber });
    const imageBuffer = Buffer.from(profileImagePath, "base64");
    const newPath = path.dirname(__dirname);
    const folderpath = path.join(newPath, "userProfile");
    const ImagePath = folderpath.replace(/\\/g, "/");
    const newName = name.replace(/\s+/g, "");
    if (fs.existsSync(`${ImagePath}/${dataProfile.Image}`)) {
      if (`${newName}.jpg` != dataProfile.Image) {
        fs.renameSync(
          `${ImagePath}/${dataProfile.Image}`,
          `${ImagePath}/${newName}.jpg`
        );
      } else {
        if (imageBuffer != "") {
          fs.unlinkSync(`${ImagePath}/${dataProfile.Image}`);
          fs.writeFile(`${ImagePath}/${newName}.jpg`, imageBuffer, (err) => {
            if (err) {
              return res.status(400).send({
                message: err.message,
              });
            }
          });
        }
      }
    } else {
      fs.writeFile(`${ImagePath}/${newName}.jpg`, imageBuffer, (err) => {
        if (err) {
          return res.status(400).send({
            message: err.message,
          });
        }
      });
    }
    const updateByNumber = { ContactNo: contactNumber };
    const update = {
      $set: {
        Name: name,
        Gender: gender,
        DOB: dob,
        Address: address,
        City: city,
        State: state,
        Pincode: pincode,
        Image: `${newName}.jpg`,
      },
    };
    const result = await User.updateOne(updateByNumber, update);
    if (result) return res.status(200).send({ message: "Profile Updated" });
    else return res.status(400).send({ message: "SomeThing Went Wrong" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc Get User Profile
//@Route /api/getUserProfile/:contactNo
//access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const { contactNo } = req.params;
  try {
    if (!contactNo) return res.status(400).send({ message: "Invalid Profile" });
    const profile = await User.findOne({ ContactNo: contactNo });
    res.status(200).send({ userProfile: profile });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc Get User Profile
//@Route /api/getUserWebsites/:userId
//access Private
const getUserWebsites = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) return res.status(400).send({ message: "Invalid User" });
    const fetchedData = await Website.find({ userId: userId });
    res.status(200).send({ websiteDetails: fetchedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

//@desc Raise Query
//@Route /api/raiseQuery
//access Private
const raiseQuery = asyncHandler(async (req, res) => {
  const { description, webSiteId, userId } = req.body;
  try {
    if (!description || !webSiteId || !userId) {
      return res.status(400).send({
        message: "Please Enter All Details",
      });
    }
    const isRaised = await Query.create({
      description: description,
      webSiteId: webSiteId,
      userId: userId,
      date: new Date(),
    });
    if (isRaised)
      return res.status(200).send({ success: true, message: "Query Raised" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

module.exports = {
  validedDomain,
  userLogin,
  sendOtp,
  verifyOtp,
  registerUser,
  updateUserProfile,
  getUserProfile,
  getUserWebsites,
  raiseQuery,
};
