const express = require("express");
const {
  userLogin,
  addImages,
  sendOtp,
  verifyOtp,
  registerUser,
} = require("../controller/userController");

const router = express.Router();

router.post("/login", userLogin);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/registerUser", registerUser);
router.post("/addImages", addImages);

module.exports = router;
