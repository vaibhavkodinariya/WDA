const express = require("express");
const {
  userLogin,
  sendOtp,
  verifyOtp,
  registerUser,
  updateUserProfile,
} = require("../controller/userController");

const router = express.Router();

router.post("/login", userLogin);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/registerUser", registerUser);
router.put("/updateUserProfile", updateUserProfile);

module.exports = router;
