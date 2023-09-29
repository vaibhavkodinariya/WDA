const express = require("express");
const { getWebSiteStatusByNumber } = require("../controller/adminController");

const router = express.Router();

router.get("/webSiteStatus/:contactNo", getWebSiteStatusByNumber);

module.exports = router;
