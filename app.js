const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv/config");

const app = express();
const env = process.env;

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(cors());
app.options("*", cors());

const hostname = env.HOST_NAME;
const port = env.PORT;
const mongodb = env.MONGODB_CONNECTION_STRING;

mongoose
  .connect(mongodb)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((error) => {
    console.error(error);
  });

app.listen(port, hostname, async () => {
  console.log(`Server running at http://${hostname}:${port}`);
});

// 1:37:25
