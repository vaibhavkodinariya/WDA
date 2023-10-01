const express = require("express");
const {
  getWebSiteStatusByNumber,
  getQueriesBySearch,
  getDetailsBySearch,
  getAllQueries,
} = require("../controller/adminController");

const router = express.Router();

router.get("/webSiteStatus/:contactNo", getWebSiteStatusByNumber);
router.get("/getQueriesBySearch/:contactNo", getQueriesBySearch);
router.get("/getDetailsBySearch/:contactNo", getDetailsBySearch);
router.get("/getAllQueries", getAllQueries);

module.exports = router;
