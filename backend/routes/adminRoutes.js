const express = require("express");
const {} = require("../controller/adminController");

const router = express.Router();

router.get("/webSiteStatus/:contactNo", userLogin);

module.exports = router;
