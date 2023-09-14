const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");

//@desc Add Business Images
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

const websiteRegister = asyncHandler(async (req, res) => {});
module.exports = { addImages, websiteRegister };
