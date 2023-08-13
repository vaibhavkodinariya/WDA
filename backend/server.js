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
app.use(express.json());
app.use(cors());

app.use("/wda/Images", express.static("businessImages"));
app.use("/wda/user", require("./routes/userRoutes"));
app.use("/wda/business", require("./routes/businessRoutes"));

app.listen(port, () => {
  console.log("WDA Server Started", port);
});
