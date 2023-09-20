const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  Type: {
    type: String,
    required: [true, "Please Enter Type Of User"],
  },
  Password: {
    type: String,
    required: [true, "please enter password"],
  },
  ContactNo: {
    type: String,
    required: [true, "please enter Contact"],
  },
  Gender: {
    type: String,
  },
  DOB: {
    type: String,
  },
  Address: {
    type: String,
  },
  City: {
    type: String,
  },
  State: {
    type: String,
  },
  Pincode: {
    type: String,
  },
  Image: {
    type: String,
  },
});

module.exports = mongoose.model("user", userSchema);
