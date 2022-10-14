require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const v1Router = require("./routers/v1");
const v2Router = require("./routers/v2");

app.use(express.json());
app.use(cors());

app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

app.listen("3001", () => {
  console.log("Server is listening on port 3001");
});

module.exports = app;
