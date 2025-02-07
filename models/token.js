const { Schema, model } = require("mongoose");

const tokenSchema = Schema({
  userId: { type: Schema.Types.ObjectId, require: true, ref: "User" },
  refresh: { type: String, require: true },
  accessToken: String,
  createdAt: { type: Date, default: Date.now, expires: 7 * 86400 },
});

exports.Token = model("Token", tokenSchema);
