const media_helper = require("../../helper/media_helper");
const { Category } = require("../../models/category");
const util = require("util");

exports.addCategory = async (req, res) => {
  try {
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

    console.log("req.files:", req.files);
    const image = req.files["image"][0];
    if (!image) return res.status(404).json({ message: "هیچ فایلی یافت نشد!" });
    req.body["image"] = `${req.protocol}://${req.get("host")}/${image.path}`;
    let category = new Category(req.body);

    category = category.save();
    if (!category)
      return res.status(500).json({ message: "دسته‌بندی ایجاد نشد." });

    return res.status(201).json(category);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, color },
      { new: true }
    );
    if (!category) {
      return res
        .status(404)
        .json({ message: "دسته بندی با این نشاسه یافت نشد" });
    }

    return res.json(category);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.param.id);
    if (!category)
      return res.status(404).json({ message: "دسته بندی یافت نشد!" });

    category.markedForDeletion = true;
    await category.save();
    return res.status(204).end();
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
