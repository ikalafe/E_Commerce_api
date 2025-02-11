const jwt = require("jsonwebtoken");
const { Token } = require("../models/token");
const { User } = require("../models/user");

async function errorHandler(error, req, res, next) {
  if (error.name === "UnauthorizedError") {
    if (!error.message.includes("jwt expired")) {
      return res
        .status(error.status)
        .json({ type: error.name, message: error.message });
    }
    try {
      const tokenHeader = req.header("Authorization");
      const accessToken = tokenHeader?.split(" ")[1];
      const token = await Token.findOne({
        accessToken,
        refreshToken: { $exists: true },
      });

      if (!token) {
        return res
          .status(401)
          .json({ type: "Unauthorized", message: "توکن موردنظر یافت نشد." });
      }

      const userData = jwt.verify(
        token.refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(userData.id);
      if (!user) {
        return res
          .status(404)
          .json({ message: "کاربر نامعتبر است یا وجود ندارد." });
      }

      const newAccessToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "24h",
        }
      );

      req.headers["authorization"] = `Brarer ${newAccessToken}`;

      await Token.updateOne(
        { _id: token.id },
        { accessToken: newAccessToken }
      ).exec();

      res.set("Authorization", `Bearer ${newAccessToken}`);

      /* 
        New Request -> check if error contains jwt expired -> make new request for new token ->
        save the new access token -> make initial request again with new token 
      */
      // New request -> check if response carries new token and save if it exists

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ type: "Unauthorized", message: refreshError.message });
    }
  }
  return res
    .status(400)
    .json({ type: error.name, message: error.message });
}

module.exports = errorHandler;
