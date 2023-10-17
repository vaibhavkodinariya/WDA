const express = require("express");
const multer = require("multer");
const {
  addImages,
  websiteRegister,
  updateRegisteredWebsite,
  uploadTemplateDetails,
} = require("../controller/websiteController");

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const extension = file.originalname.split(".");
    if (extension[1] === "html") {
      cb(null, "E:/Projects/WDA/backend/businessTemplates/");
    } else {
      cb(null, "E:/Projects/WDA/backend/templateImages/");
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

router.post("/addImages", addImages);
router.post("/websiteRegister", websiteRegister);
router.put("/updateWebsite", updateRegisteredWebsite);

router.post(
  "/uploadTemplateDetails",
  upload.fields([{ name: "template" }, { name: "templateImage" }]),
  uploadTemplateDetails
);

module.exports = router;
