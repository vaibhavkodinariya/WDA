const asyncHandler = require("express-async-handler");
const Status = require("../models/statusModel");
const User = require("../models/userModel");
const Website = require("../models/websiteModel");

//@desc Get Website Status By Number
//@Route /wda/admin/webSiteStatus/:contactNo
//access Private
const getWebSiteStatusByNumber = asyncHandler(async (req, res) => {
  const { contactNo } = req.params;
  if (!contactNo) {
    return res.send({ success: false, message: "Invalid User" });
  } else {
    const condition = {
      ContactNo: contactNo,
    };
    const result = await User.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "websites",
          localField: "_id", // Field in the "User" collection
          foreignField: "userId", // Field in the "website" collection
          as: "websites",
        },
      },
    ]);

    const statusDetails = [];
    for (data of result[0]["websites"]) {
      var promise = await new Promise((resolve) => {
        const status = Status.find({ webSiteId: data["_id"].toString() });
        resolve(status);
      });
      statusDetails.push(promise[0]);
    }

    const mergedData = statusDetails.map((status) => {
      const matchingWebsite = result[0]["websites"].find((website) =>
        website._id.equals(status.webSiteId)
      );
      if (matchingWebsite) {
        // console.log(status["_id"]);
        return {
          statusName: status["statusName"],
          webSiteId: status["webSiteId"].toString(),
          domainName: matchingWebsite.domainName,
        };
      } else {
        return status;
      }
    });
    res.send({
      success: true,
      Name: result[0]["Name"],
      ContactNo: result[0]["ContactNo"],
      statusData: mergedData,
    });
  }
});

//@desc Get Queries By Number
//@Route /wda/admin/getQueriesBySearch/:contactNo
//access Private
const getQueriesBySearch = asyncHandler(async (req, res) => {
  const { contactNo } = req.params;
  if (!contactNo) {
    return res.send({ success: false, message: "Invalid User" });
  } else {
    const condition = {
      ContactNo: contactNo,
    };
    const result = await User.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "queries",
          localField: "_id", // Field in the "User" collection
          foreignField: "userId", // Field in the "Query" collection
          as: "queries",
        },
      },
    ]);
    res.send({ success: true, queries: result[0]["queries"] });
  }
});
//@desc Get Queries By Number
//@Route /wda/admin/getDetailsBySearch/:contactNo
//access Private
const getDetailsBySearch = asyncHandler(async (req, res) => {
  const { contactNo } = req.params;
  if (!contactNo) {
    return res.send({ success: false, message: "Invalid User" });
  } else {
    const result = await User.findOne({ ContactNo: contactNo });
    res.send({ success: true, details: result });
  }
});
module.exports = {
  getWebSiteStatusByNumber,
  getQueriesBySearch,
  getDetailsBySearch,
};
