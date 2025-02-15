const { default: mongoose } = require("mongoose");
const { User } = require("../models/user");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email ـid isAdmin");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "کاربر یافت نشد ):" });
    }
    return res.json(users);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "شناسه کاربر نامعتبر است." });
    }

    const user = await User.findById(req.params.id).select(
      "-passwordHash -resetPasswordOtp -resetPasswordOtpExpires -cart"
    );

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, isAdmin } = req.body;

    // بررسی معتبر بودن `ObjectId`
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "شناسه کاربر نامعتبر است." });
    }

    const updateUser = await User.findByIdAndUpdate(
      id,
      { name, email, phone, isAdmin },
      { new: true, runValidators: true }
    ).select("-passwordHash -resetPasswordOtp -resetPasswordOtpExpires -cart");
    if (!updateUser) {
      return res.status(404).json({ message: "کاربر یافت نشد." });
    }

    // user.passwordHash = undefined;
    // user.cart = undefined;
    
    return res.json({
      message: "کاربر با موفقیت به روز رسانی شد.",
      user: updateUser,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
