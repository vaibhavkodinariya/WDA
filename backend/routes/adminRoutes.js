const express = require("express");
const {
  getWebSiteStatusByNumber,
  getQueriesBySearch,
  getDetailsBySearch,
  getAllQueries,
  updateWebSiteStatus,
  getAllStatus,
  getAllTemplates,
} = require("../controller/adminController");

const router = express.Router();

router.get("/webSiteStatus/:contactNo", getWebSiteStatusByNumber);
router.get("/getQueriesBySearch/:contactNo", getQueriesBySearch);
router.get("/getDetailsBySearch/:contactNo", getDetailsBySearch);
router.get("/getAllQueries", getAllQueries);
router.get("/getAllStatus", getAllStatus);
router.get("/getAllTemplates", getAllTemplates);
router.put("/updateWebSiteStatus", updateWebSiteStatus);

module.exports = router;
