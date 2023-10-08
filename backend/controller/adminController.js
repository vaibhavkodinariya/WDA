const asyncHandler = require("express-async-handler");
const Status = require("../models/statusModel");
const User = require("../models/userModel");
const Query = require("../models/queryModel");
const Template = require("../models/templateModel");

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

//@desc Get All Users Queries
//@Route /wda/admin/getAllQueries
//access Private
const getAllQueries = asyncHandler(async (req, res) => {
  const result = await Query.find();
  res.send({ success: true, queries: result });
});

//@desc Update WebSite Status
//@Route /wda/admin/updateWebSiteStatus
//access Private
const updateWebSiteStatus = asyncHandler(async (req, res) => {
  const { webSiteId, status } = req.body;
  const updateBywebSiteId = { webSiteId: webSiteId };
  const update = {
    $set: {
      statusName: status,
    },
  };
  const result = await User.updateOne(updateBywebSiteId, update);
  if (result) {
    return res.send({ success: true, message: "Status Changed" });
  } else {
    return res.send({ success: false, message: "SomeThing Went Wrong" });
  }
});

//@desc Get All Status
//@Route /wda/admin/getAllStatus
//access Private
const getAllStatus = asyncHandler(async (req, res) => {
  const result = await User.aggregate([
    {
      $lookup: {
        from: "websites",
        localField: "_id", // Field in the "User" collection
        foreignField: "userId", // Field in the "website" collection
        as: "websites",
      },
    },
  ]);

  var userData;
  const statusDetails = [];
  for (var i = 0; i < result.length; i++) {
    if (result[i]["websites"].length > 0) {
      for (var website of result[i]["websites"]) {
        const status = await Status.find({
          webSiteId: website["_id"].toString(),
        });
        userData = {
          Name: result[i]["Name"],
          userId: result[i]["_id"].toString(),
          contactNo: result[i]["ContactNo"],
          websiteDomain: website["domainName"],
          websiteType: website["websiteType"],
          websiteStatus: status[0]["statusName"],
        };
        statusDetails.push(userData);
      }
    }
  }

  res.send({
    success: true,
    allStatusDetails: statusDetails,
  });
});

//@desc Get All Templates
//@Route /wda/admin/getAllTemplates
//access Private
const getAllTemplates = asyncHandler(async (req, res) => {
  const templates = await Template.find();
  res.json({ success: true, templates });
});

module.exports = {
  getWebSiteStatusByNumber,
  getQueriesBySearch,
  getDetailsBySearch,
  getAllQueries,
  updateWebSiteStatus,
  getAllStatus,
  getAllTemplates,
};
