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
      return res.status(500);
    }

    return res.status(201).json(user );
  } catch (e) {
    return res.status(500).json({ type: e.name, message: e.message });
  }
};

exports.login = async (req, res) => {};

exports.forgotPassword = async (req, res) => {};

exports.verifyPasswordResetOtp = async (req, res) => {};

exports.resetPassword = async (req, res) => {};

// 5:02:34