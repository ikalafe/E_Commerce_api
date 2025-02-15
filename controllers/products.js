const { Product } = require("../models/product");

exports.getProducts = async (req, res) => {
  try {
    let products;
    const page = req.query.page || 1;
    const pageSize = 10;

    if (req.query.criteria) {
      let query = {};
      if (req.query.category) {
        query["category"] = req.query.category;
      }
      switch (req.query.criteria) {
        case "newArrivals": {
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          query["dateAdded"] = { $gte: twoWeeksAgo };
          break;
        }
        case "popular":
          query["rating"] = { $gte: 4.5 };
          break;
        default:
          break;
      }
      products = await Product.find(query)
        .select("-images -reviews -sizes")
        .skip((page - 1) * pageSize)
        .limit(pageSize);
    } else if (req.query.category) {
      products = await Product.find({ category: req.query.category })
        .select("-images -reviews -sizes")
        .skip((page - 1) * pageSize)
        .limit(pageSize);
    } else {
      products = await Product.find()
        .select("-images -reviews -sizes")
        .skip((page - 1) * pageSize)
        .limit(pageSize);
    }
    if (!products) {
      return res.status(404).json({ message: "محصول یافت نشد!" });
    }
    return res.json(products);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    let query = {};

    if (req.query.category) {
      query = { category: req.query.category };
      if (req.query.genderAgeCategory) {
        query["genderAgeCategory"] = req.query.genderAgeCategory.toLowerCase();
      }
    } else if (req.query.genderAgeCategory) {
      query = {
        genderAgeCategory: req.query.genderAgeCategory.toLowerCase(),
      };
    }
    if (searchTerm) {
      query = {
        ...query,
        $text: {
          $search: searchTerm,
          $language: "english",
          $caseSensitive: false,
        },
      };
    }
    const searchResults = await Product.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getProductById = async (req, res) => {};

// 1:12:27