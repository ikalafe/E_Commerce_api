const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessage });
  }
  try {
    let user = new User({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 8),
    });

    user = await user.save();

    if (!user) {
      return res.status(500).json({
        type: "Internal Server Error",
        message: "کاربر ایجاد نشد‌): لطفا بعدا دوباره تلاش کنید",
      });
    }

    return res.status(201).json(user);
  } catch (e) {
    if (e.message.includes("email_1 dup key")) {
      return res.status(409).json({
        type: "Auth Error",
        message: "کاربر با این ایمیل از قبل وجود دارد.",
      });
    }
    return res.status(500).json({ type: e.name, message: e.message });
  }
};

exports.login = async (req, res) => {};

exports.forgotPassword = async (req, res) => {};

exports.verifyPasswordResetOtp = async (req, res) => {};

exports.resetPassword = async (req, res) => {};
