const mongoose = require("mongoose");

const templateSchema = mongoose.Schema({
  templatePath: { type: String },
  imageName: { type: String },
});

module.exports = mongoose.model("template", templateSchema);
