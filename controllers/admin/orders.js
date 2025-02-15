const { Order } = require("../../models/order");
const { Product } = require("../../models/product");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .select("-statusHistory")
      .populate("user", "name email")
      .sort({ dateOrdered: -1 })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "name",
          populate: { path: "category", select: "name" },
        },
      });
    if (!orders) return res.status(404).json({ message: "سفارشی یافت نشد." });

    return res.json(orders);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    if (!count)
      return res.status(500).json({ message: "خطا در شمارش سفارش‌ها رخ داد" });
    
    
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.changeOrderStatus = async (req, res) => {};
