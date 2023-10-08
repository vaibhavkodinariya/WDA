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
  var webDetails;
  var details;
  const statusDetails = [];
  const userDetails = [];
  for (var i = 0; i < result.length; i++) {
    if (result[i]["websites"].length > 0) {
      for (var website of result[i]["websites"]) {
        const status = await Status.find({
          webSiteId: website["_id"].toString(),
        });
        if (status.length > 0) {
          for (var state of status) {
            details = {
              _id: result[i]["_id"].toString(),
              Name: result[i]["Name"],
              ContactNo: result[i]["ContactNo"],
            };
            webDetails = {
              userId: website["userId"].toString(),
              webSiteId: website["_id"].toString(),
              webName: website["websiteName"],
              domainName: website["domainName"],
              statusName: state["statusName"],
            };
          }
          statusDetails.push(webDetails);
          userDetails.push(details);
        }
      }
    }
  }

  const combinedArray = [];

  // Create a mapping of userId to objects in array1 for efficient lookup
  const userIdToData1Mapping = {};
  userDetails.forEach((item1) => {
    if (!userIdToData1Mapping[item1._id]) {
      userIdToData1Mapping[item1._id] = {
        _id: item1._id,
        Name: item1.Name,
        ContactNo: item1.ContactNo,
        website: [],
      };
    }
  });

  // Iterate through array2 and add objects to combinedArray
  statusDetails.forEach((item2) => {
    const data1Item = userIdToData1Mapping[item2.userId];
    if (data1Item) {
      data1Item.website.push({
        userId: item2.userId,
        webSiteId: item2.webSiteId,
        webName: item2.webName,
        domainName: item2.domainName,
        statusName: item2.statusName,
      });
    }
  });

  // Convert the values of userIdToData1Mapping to an array
  combinedArray.push(...Object.values(userIdToData1Mapping));

  console.log(combinedArray);
  // statusDetails.forEach((item1) => {
  //   const matchingItem2 = userDetails.find(
  //     (item2) => item1._id === item2.userId
  //   );
  //   if (matchingItem2) {
  //     Object.assign(item1, matchingItem2);
  //   }
  // });

  res.send({
    success: true,
    allStatusDetails: combinedArray,
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
