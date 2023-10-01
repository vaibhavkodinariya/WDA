const express = require("express");
const {
  getWebSiteStatusByNumber,
  getQueriesBySearch,
} = require("../controller/adminController");

const router = express.Router();

router.get("/webSiteStatus/:contactNo", getWebSiteStatusByNumber);
router.get("/getQueriesBySearch/:contactNo", getQueriesBySearch);

module.exports = router;
