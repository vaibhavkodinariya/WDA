const asyncHandler = require("express-async-handler");

//@desc Get Website Status By Number
//@Route /wda/admin/webSiteStatus/:contactNo
//access Private
const getWebSiteStatusByNumber = asyncHandler(async (req, res) => {
  const { contactNo } = req.params;
  if (!contactNo) {
    return res.send({ success: false, message: "Invalid User" });
  } else {
  }
});

module.exports = { getWebSiteStatusByNumber };
