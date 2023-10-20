const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const Website = require("../models/websiteModel");
const Template = require("../models/templateModel");
const Status = require("../models/statusModel");

//@desc Add Website Images
//@Route /api/user/addImages
//access Private
const addImages = asyncHandler(async (req, res) => {
  const { businessName, imageID, imagePath } = req.body;

  if (!businessName || !imageID || !imagePath) {
    return res.send({ success: false, message: "Something Went Wrong" });
  } else {
    const imageBuffer = Buffer.from(imagePath, "base64");

    const newPath = path.dirname(__dirname);

    const businessNameToStore = businessName.replace(/\s+/g, "");

    const folderpath = path.join(
      newPath,
      "businessImages",
      businessNameToStore
    );

    const businessImagePath = folderpath.replace(/\\/g, "/");
    fs.mkdir(folderpath, { recursive: true }, (err) => {
      if (err) {
        return res.send({ success: false, message: "Something Went Wrong" });
      } else {
        fs.writeFile(
          `${businessImagePath}/${imageID}.jpg`,
          imageBuffer,
          (err) => {
            if (err) {
              return res.send({
                success: false,
                message: "Error saving image to Server",
              });
            } else {
              res.send({
                id: imageID,
                url: `wda/Images/${businessNameToStore}/${imageID}.jpg`,
              });
            }
          }
        );
      }
    });
  }
});

//@desc Website Registeration
//@Route /api/user/websiteRegister
//access Private
const websiteRegister = asyncHandler(async (req, res) => {
  const {
    htmlFile,
    webSiteName,
    websiteType,
    dateOfIncorporation,
    corporateIdentificationNo,
    taxDeductionAccNo,
    goodsServiceTax,
    userId,
  } = req.body;
  if (!htmlFile || !webSiteName || !websiteType || !userId) {
    return res.send({
      success: false,
      message: "Please Give Appropriate Data",
    });
  } else {
    let isActive = await Website.findOne({ websiteName: webSiteName });
    if (isActive) {
      return res.send({
        success: false,
        message: "Website Already Registered",
      });
    } else {
      const newPath = path.dirname(__dirname);

      const webSiteNameToStore = webSiteName.replace(/\s+/g, "");

      const folderpath = path.join(newPath, "businessWebsite");

      const htmlBuffer = Buffer.from(htmlFile, "base64");

      zlib.gunzip(htmlBuffer, (err, decompressedHtml) => {
        if (err) {
          console.error("Error decompressing HTML:", err);
          return;
        }

        fs.writeFile(
          folderpath + `/` + `${webSiteNameToStore}.html`,
          decompressedHtml,
          "utf8",
          (writeErr) => {
            if (writeErr) {
              return res.send({
                success: false,
                message: "Error Registering Website",
              });
            }
          }
        );
      });
      const websiteRegisteration = await Website.create({
        websiteName: webSiteName,
        websiteType: websiteType,
        dateOfIncorporation: dateOfIncorporation,
        corporateIdentificationNo: corporateIdentificationNo,
        taxDeductionAccNo: taxDeductionAccNo,
        goodsAndServicesTax: goodsServiceTax,
        domainName: `${webSiteNameToStore}.html`,
        userId: userId,
      });
      if (websiteRegisteration) {
        const insertedId = websiteRegisteration._id;
        await Status.create({ statusName: "hosted", webSiteId: insertedId });
        return res.send({
          success: true,
          message: "Website Registered",
          domainName: webSiteName,
        });
      } else {
        return res.send({ success: false, message: "Something Went Wrong" });
      }
    }
  }
});

//@desc Update Website
//@Route /business/updateWebsite
//access Private
const updateRegisteredWebsite = asyncHandler(async (req, res) => {
  const { updatedWebsiteCode, webSiteName } = req.body;
  if (!updatedWebsiteCode || !webSiteName) {
    return res.send({ success: false, message: "Data Is Not Appropriate" });
  } else {
    const newPath = path.dirname(__dirname);

    const webSiteNameToStore = webSiteName.replace(/\s+/g, "");

    const folderpath = path.join(newPath, "businessWebsite");

    const htmlBuffer = Buffer.from(updatedWebsiteCode, "base64");

    zlib.gunzip(htmlBuffer, (err, decompressedHtml) => {
      if (err) {
        console.error("Error decompressing HTML:", err);
        return;
      }
      fs.unlinkSync(
        folderpath + `\\` + `${webSiteNameToStore}.html`,
        decompressedHtml,
        "utf8"
      );
      fs.writeFile(
        folderpath + `\\` + `${webSiteNameToStore}.html`,
        decompressedHtml,
        "utf8",
        (writeErr) => {
          if (writeErr) {
            return res.send({
              success: false,
              message: "Error Updating Website",
            });
          } else {
            return res.send({
              success: true,
              message: "Your Website Updated..",
            });
          }
        }
      );
    });
  }
});

//@desc Update Website
//@Route /business/uploadTemplateDetails
//access Private
const uploadTemplateDetails = asyncHandler(async (req, res) => {
  const uploadedFile1 = req.files["template"][0];
  const htmlName = uploadedFile1.originalname;

  const uploadedFile2 = req.files["templateImage"][0];
  const gifName = uploadedFile2.originalname;
  const { name, extension } = gifName.split(".");
  const templateInsert = await Template.create({
    templatePath: `/wda/templates/${htmlName}`,
    imageName: name,
  });
  if (templateInsert) {
    res.send({ succes: true, message: "Files uploaded successfully" });
  } else {
    res.send({ succes: false, message: "Something Went Wrong" });
  }
});
module.exports = {
  addImages,
  websiteRegister,
  updateRegisteredWebsite,
  uploadTemplateDetails,
};
