const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Token } = require("../models/token");
const mailSender = require("../helper/email_sender");

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
  } catch (error) {
    if (error.message.includes("email_1 dup key")) {
      return res.status(409).json({
        type: "Auth Error",
        message: "کاربر با این ایمیل از قبل وجود دارد.",
      });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "کاربر پیدا نشد\nایمیل خود را بررسی کنید و دوباره امتحان کنید",
      });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: "رمز عبور اشتبه است" });
    }

    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const token = await Token.findOne({ userId: user.id });
    if (token) await token.deleteOne();
    await new Token({
      userId: user.id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    }).save();

    user.passwordHash = undefined;
    return res.json({ ...user._doc, accessToken });
  } catch (error) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) return res.json(false);
    accessToken = accessToken.replace("Bearer", "").trim();

    const token = await Token.findOne({ accessToken });
    if (!token) return res.json(false);

    const tokenData = jwt.decode(token.refreshToken);
    const user = await User.findById(tokenData.id);
    if (!user) return res.json(false);

    const isValid = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!isValid) return res.json(false);

    return res.json(true);
  } catch (error) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    console.log(email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "کاربر با این ایمیل پیدا نشد :(" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 600000;

    await user.save();

    const response = await mailSender.sendMail(
      email,
      "بازنشانی رمز عبور.",
      `رمز یکبار مصرف برایه: ${otp}`
    );
    
    return res.json({
      message: response,
    });
  } catch (error) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.verifyPasswordResetOtp = async (req, res) => {};

exports.resetPassword = async (req, res) => {};

// 6:34:39
