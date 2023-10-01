const mongoose = require("mongoose");

const querySchema = mongoose.Schema({
  description: { type: String, required: [true, "Description Required"] },
  webSiteId: {
    type: mongoose.Schema.ObjectId,
    ref: "website",
    required: [true, "website Required"],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: [true, "user Required"],
  },
  date: { type: Date, required: [true, "Date Required"] },
});

module.exports = mongoose.model("query", querySchema);
