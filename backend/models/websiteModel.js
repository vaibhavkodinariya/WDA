const mongoose = require("mongoose");

const websiteSchema = mongoose.Schema({
  websiteName: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  websiteType: {
    type: String,
    required: [true, "Please Enter Type Of User"],
  },
  dateOfIncorporation: {
    type: String,
  },
  corporateIdentificationNo: {
    type: String,
  },
  taxDeductionAccNo: {
    type: String,
  },
  goodsServiceTax: {
    type: String,
  },
  domainName: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("website", websiteSchema);
