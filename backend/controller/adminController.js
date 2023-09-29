const asyncHandler = require("express-async-handler");

//@desc Get Website Status By Number
//@Route /wda/admin/webSiteStatus/:contactNo
//access Private
const getWebSiteStatusByNumber = asyncHandler(async (req, res) => {});

module.exports = { getWebSiteStatusByNumber };
