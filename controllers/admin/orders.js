const { Order } = require("../../models/order");
const { OrderItem } = require("../../models/order_Item");

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

exports.getOrdersCount = async (_, res) => {
  try {
    const count = await Order.countDocuments();
    if (!count)
      return res.status(500).json({ message: "خطا در شمارش سفارش‌ها رخ داد" });
    return res.json({ count });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.changeOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const newStatus = req.body.status;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "سفارشی یافت نشد." });

    if (!order.statusHistory.includes(order.status)) {
      order.statusHistory.push(order.status);
    }
    order.status = newStatus;
    order = await order.save();
    return res.json(order);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ message: "سفارشی یافت نشد." });

    for (const orderItemId of order.orderItems) {
      await OrderItem.findByIdAndDelete(orderItemId);
    }

    return res.status(204).end();
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
