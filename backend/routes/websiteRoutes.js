const express = require("express");
const {
  addImages,
  websiteRegister,
  updateRegisteredWebsite,
} = require("../controller/websiteController");

const router = express.Router();

router.post("/addImages", addImages);
router.post("/websiteRegister", websiteRegister);
router.put("/updateWebsite", updateRegisteredWebsite);

module.exports = router;
