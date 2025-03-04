const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv/config");

const authJwt = require("./middlewares/jwt");
const errorHandler = require("./middlewares/error_handler");

const app = express();
const env = process.env;
const API = env.API_URL;

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(cors());
app.options("*", cors());
app.use(authJwt());
app.use(errorHandler);

const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");

app.use(`${API}/`, authRouter);
app.use(`${API}/users`, userRouter);
app.use(`${API}/admin`, adminRouter);
app.use(`${API}/categories`, categoriesRouter);
app.use(`${API}/products`, productsRouter);
app.use("/public", express.static(__dirname + "/public"));

const hostname = env.HOST_NAME;
const port = env.PORT;
const mongodb = env.MONGODB_CONNECTION_STRING;

require("./helper/cron_job");

mongoose
  .connect(mongodb)
  .then(() => {
    console.log("Connected to Database.");
  })
  .catch((error) => {
    console.error(error);
  });

app.listen(port, hostname, async () => {
  console.log(`Server running at http://${hostname}:${port}`);
  console.log("connecting to database...");
});
