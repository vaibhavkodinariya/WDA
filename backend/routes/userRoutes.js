const express = require("express");
const {
  userLogin,
  sendOtp,
  verifyOtp,
  registerUser,
  updateUserProfile,
  getUserProfile,
  getUserWebsites,
  raiseQuery,
  validedDomain,
} = require("../controller/userController");

const router = express.Router();

router.post("/login", userLogin);
router.get("/getUserProfile/:contactNo", getUserProfile);
router.get("/getUserWebsites/:userId", getUserWebsites);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/registerUser", registerUser);
router.put("/updateUserProfile", updateUserProfile);
router.post("/raiseQuery", raiseQuery);
router.get("/validedUser/:domain", validedDomain);

module.exports = router;
