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
    return res.status(400).send({ message: "Invalid User" });
  }
  const result = await User.aggregate([
    {
      $match: { ContactNo: contactNo },
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
    }
    return status;
  });
  res.status(200).send({
    id: result[0]["_id"],
    Name: result[0]["Name"],
    ContactNo: result[0]["ContactNo"],
    statusData: mergedData,
  });
});

//@desc Get Queries By Number
//@Route /wda/admin/getQueriesBySearch/:contactNo
//access Private
const getQueriesBySearch = asyncHandler(async (req, res) => {
  const { contactNo } = req.params;
  if (!contactNo) return res.status(400).send({ message: "Invalid User" });
  try {
    const result = await User.aggregate([
      {
        $match: { ContactNo: contactNo },
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
    var queriesList = [];
    for (var queries of result[0]["queries"]) {
      const webSiteId = queries["webSiteId"].toString();
      const queriesDetails = await Website.find({
        _id: webSiteId,
      });
      const queryStructure = {
        description: queries["description"],
        webId: webSiteId,
        webName: queriesDetails[0]["websiteName"],
        date: queries["date"],
      };
      queriesList.push(queryStructure);
    }
    return res.status(200).send({
      Name: result[0]["Name"],
      ContactNo: result[0]["ContactNo"],
      queries: queriesList,
    });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

//@desc Get Queries By Number
//@Route /wda/admin/getDetailsBySearch/:contactNo
//access Private
const getDetailsBySearch = asyncHandler(async (req, res) => {
  const { contactNo } = req.params;
  try {
    if (!contactNo) return res.status(400).send({ message: "Invalid User" });
    const result = await User.findOne({ ContactNo: contactNo });
    res.status(200).send({ details: result });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

//@desc Get All Users Queries
//@Route /wda/admin/getAllQueries
//access Private
const getAllQueries = asyncHandler(async (req, res) => {
  try {
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
    res.status(200).send({ info: infodetails });
  } catch (error) {
    res.status(400).send({ info: error.message });
  }
});

//@desc Update WebSite Status
//@Route /wda/admin/updateWebSiteStatus
//access Private
const updateWebSiteStatus = asyncHandler(async (req, res) => {
  const { webSiteId, status } = req.body;
  const update = {
    $set: {
      statusName: status,
    },
  };
  try {
    const result = await Status.updateOne({ webSiteId: webSiteId }, update);
    if (result) return res.status(200).send({ message: "Status Changed" });
    return res.status(200).send({ message: "Status Not Changed" });
  } catch (error) {
    res.status(400).send({ message: error.message });
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

  res.status(200).send({
    allStatusDetails: combinedArray,
  });
});

//@desc Get All Templates
//@Route /wda/admin/getAllTemplates
//access Private
const getAllTemplates = asyncHandler(async (req, res) => {
  const templates = await Template.find();
  res.status(200).send({ templates });
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
