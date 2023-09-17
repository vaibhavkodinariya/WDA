const express = require("express");
const {
  addImages,
  websiteRegister,
  updateRegisteredWebsite,
} = require("../controller/websiteController");

const router = express.Router();

router.post("/addImages", addImages);
router.post("/websiteRegister", websiteRegister);
router.post("/updateWebsite", updateRegisteredWebsite);

module.exports = router;
