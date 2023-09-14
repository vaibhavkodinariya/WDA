const express = require("express");
const { addImages } = require("../controller/websiteController");

const router = express.Router();

router.post("/addImages", addImages);

module.exports = router;
