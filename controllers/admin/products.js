const { Product } = require("../../models/product");
const media_helper = require("../../helper/media_helper");
const { Category } = require("../../models/category");
const util = require("util");
const multer = require("multer");
const { default: mongoose } = require("mongoose");

exports.getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (!count) {
      return res.status(500).json({ message: "خطا در شمارش محصولات رخ داد." });
    }
    return res.json({ count });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getProducts = async (req, res) => {};

exports.addProduct = async (req, res) => {
  try {
    const uploadImage = util.promisify(
      media_helper.upload.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
      ])
    );
    try {
      await uploadImage(req, res);
    } catch (error) {
      console.error("Error: ", error);
      return res.status(500).json({
        type: error.code,
        message: `${error.message} {${err.field}}`,
        storageErrors: error.storageErrors,
      });
    }

    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({ message: "دسته بندی یافت نشد!" });
    }

    if (category.markedForDeletion) {
      return res.status(404).json({
        message:
          "این دسته‌بندی در صف حذف قرار دارد و امکان افزودن محصول به آن وجود ندارد.",
      });
    }

    const image = req.files["image"][0];
    if (!image) {
      return res.status(404).json({ message: "هیچ فایلی یافت نشد!" });
    }

    req.body["image"] = `${req.protocol}://${req.get("host")}/${image.path}`;

    const gallery = req.files["images"];
    const imagePaths = [];
    if (gallery) {
      for (const image of gallery) {
        const imagePath = `${req.protocol}://${req.get("host")}/${image.path}`;
        imagePaths.push(imagePath);
      }
    }
    if (imagePaths.length > 0) {
      req.body["images"] = imagePaths;
    }

    const product = await new Product(req.body).save();
    if (!product) {
      return res.status(500).json({ message: "ایجاد محصول با مشکل مواجه شد." });
    }
    return res.status(201).json(product);
  } catch (error) {
    console.error("Error: ", error);
    if (err instanceof multer.MulterError) {
      return res.status(err.code).json({ message: err.message });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.editProduct = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !(await Product.findById(req.params.id))
    ) {
      return res.status(404).json({ message: "محصول نامعتبر است." });
    }
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).json({ message: "دسته بندی معتبر نیست" });
      }
      if (category.markedForDeletion) {
        return res.status(404).json({
          message:
            "این دسته‌بندی در صف حذف قرار دارد و امکان افزودن محصول به آن وجود ندارد.",
        });
      }

      const product = await Product.findById(req.params.id);

      if (req.body.images) {
        const limit = 10 - product.images.length;
        const uploadGallery = util.promisify(
          media_helper.upload.fields([{ name: "images", maxCount: limit }])
        );
        try {
          await uploadGallery(req, res);
        } catch (error) {
          console.error("Error: ", error);
          return res.status(500).json({
            type: error.code,
            message: `${error.message} {${err.field}}`,
            storageErrors: error.storageErrors,
          });
        }

        const imageFiles = req.files["images"];
        const updateGallery = imageFiles && imageFiles.length > 0;
        if (updateGallery) {
          const imagePaths = [];
          for (const image of gallery) {
            const imagePath = `${req.protocol}://${req.get("host")}/${
              image.path
            }`;
            imagePaths.push(imagePath);
          }
          req.body["images"] = [...product.images, ...imagePaths];
        }
      }
      if (req.body.image) {
        const uploadImage = util.promisify(
          media_helper.upload.fields([{ name: "image", maxCount: 1 }])
        );
        try {
          await uploadImage(req, res);
        } catch (error) {
          console.error("Error: ", error);
          return res.status(500).json({
            type: error.code,
            message: `${error.message} {${err.field}}`,
            storageErrors: error.storageErrors,
          });
        }

        const image = req.files["image"][0];
        if (!image)
          return res.status(404).json({ message: "هیچ فایلی یافت نشد!" });
        req.body["image"] = `${req.protocol}://${req.get("host")}/${
          image.path
        }`;
      }
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "محصول یافت نشد." });
    }
    return res.json(updatedProduct);
  } catch (error) {
    console.error("Error: ", error);
    if (err instanceof multer.MulterError) {
      return res.status(err.code).json({ message: err.message });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteProductImages = async (req, res) => {};

exports.deleteProduct = async (req, res) => {};

// 11:17:26
