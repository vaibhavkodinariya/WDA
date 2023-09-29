const mongoose = require("mongoose");

const statusSchema = mongoose.Schema({
  statusName: { type: String },
  webSiteId: { type: mongoose.Schema.ObjectId, ref: "website" },
});

module.exports = mongoose.model("status", statusSchema);
