const { User } = require("../models/user");
const { Review } = require("../models/review");
const { Product } = require("../models/product");
const { default: mongoose } = require("mongoose");

exports.leaveReview = async (req, res) => {
  try {
    const { id } = req.params;

    // بررسی معتبر بودن `ObjectId`
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "شناسه محصول نامعتبر است." });
    }
    const user = await User.findById(req.body.user);
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد." });
    }

    const review = await new Review({
      ...req.body,
      userName: user.name,
    }).save();

    if (!review) {
      return res
        .status(400)
        .json({ message: "ثبت نظر با مشکل مواجه شد، لطفاً دوباره تلاش کنید." });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد." });
    }
    product.reviews.push(review.id);
    product = await product.save();

    if (!review) {
      return res
        .status(400)
        .json({ message: "خطای داخلی سرور رخ داد، لطفاً بعداً تلاش کنید." });
    }
    return res.status(201).json({ product, review });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
