const express = require("express");
const {
  addImages,
  websiteRegister,
} = require("../controller/websiteController");

const router = express.Router();

router.post("/addImages", addImages);
router.post("/websiteRegister", websiteRegister);

module.exports = router;
