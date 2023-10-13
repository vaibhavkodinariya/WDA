const asyncHandler = require("express-async-handler");
const Status = require("../models/statusModel");
const User = require("../models/userModel");
const Query = require("../models/queryModel");
const Template = require("../models/templateModel");
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
        return {
          statusName: status["statusName"],
          webSiteId: status["webSiteId"].toString(),
          websiteName: matchingWebsite.websiteName,
          domainName: matchingWebsite.domainName,
          type: matchingWebsite.websiteType,
        };
      } else {
        return status;
      }
    });
    res.send({
      success: true,
      id: result[0]["_id"],
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
    try {
      var queriesList = [];
      for (var queries of result[0]["queries"]) {
        const webSiteId = queries["webSiteId"].toString();
        const queriesDetails = await Website.find({
          _id: webSiteId,
        });
        // console.log(queriesDetails);
        const queryStructure = {
          description: queries["description"],
          webId: webSiteId,
          webName: queriesDetails[0]["websiteName"],
          date: queries["date"],
        };
        queriesList.push(queryStructure);
      }
      // console.log(queriesDetails);
      res.send({
        success: true,
        Name: result[0]["Name"],
        ContactNo: result[0]["ContactNo"],
        queries: queriesList,
      });
    } catch (e) {
      console.log(e);
    }
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
  // const result = await Query.find();
  const result = await User.aggregate([
    {
      $lookup: {
        from: "queries",
        localField: "_id", // Field in the "User" collection
        foreignField: "userId", // Field in the "Query" collection
        as: "queries",
      },
    },
  ]);
  const infodetails = [];
  for (var details of result) {
    if (details["queries"].length > 0) {
      var queriesDetails = {
        id: details["_id"],
        name: details["Name"],
        contactNo: details["ContactNo"],
      };
      infodetails.push(queriesDetails);
    }
  }

  res.send({ success: true, info: infodetails });
});

//@desc Update WebSite Status
//@Route /wda/admin/updateWebSiteStatus
//access Private
const updateWebSiteStatus = asyncHandler(async (req, res) => {
  const { webSiteId, status } = req.body;
  console.log(req.body);
  const updateBywebSiteId = { webSiteId: webSiteId };
  const update = {
    $set: {
      statusName: status,
    },
  };
  const result = await Status.updateOne(updateBywebSiteId, update);
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
              websiteType: website["websiteType"],
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
        websiteType: item2.websiteType,
        webName: item2.webName,
        domainName: item2.domainName,
        statusName: item2.statusName,
      });
    }
  });

  combinedArray.push(...Object.values(userIdToData1Mapping));

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
