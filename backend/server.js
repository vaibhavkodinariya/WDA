const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const colors = require("colors");
const port = process.env.PORT;
const cors = require("cors");
const app = express();
connectDB();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.use("/wda", express.static("businessWebsite"));
app.use("/wda/templates", express.static("businessTemplates"));
app.use("/wda/templatesImages", express.static("templateImages"));
app.use("/wda/Images", express.static("businessImages"));
app.use("/wda/userProfile", express.static("userProfile"));
app.use("/wda/user", require("./routes/userRoutes"));
app.use("/wda/business", require("./routes/websiteRoutes"));
app.use("/wda/admin", require("./routes/adminRoutes"));

app.listen(port, () => {
  console.log("WDA Server Started", port);
});
