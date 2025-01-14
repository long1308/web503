import { categorySchema } from "../Schemas/product";
import Category from "../models/category";
import Products from "../models/product";
export const getAll = async (req, res) => {
  try {
    const data = await Category.find();

    if (data.length == 0) {
      return res.status(404).json({ message: "Lấy tất danh mục thất bại" });
    } else {
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export const get = async (req, res) => {
  try {
    const data = await Category.findById(req.params.id).populate("products");
    if (data.length == 0) {
      return res.status(400).json({ message: "Lấy sản phẩm 1 thất bại" });
    } else {
      // lấy sản phẩm chứa danh mục
      const products = await Products.find({ categoryId: req.params.id });

      return res.status(200).json({
        ...data.toObject(),
        products,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export const add = async (req, res) => {
  try {
    //validate
    const { error } = categorySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // const { data } = await axios.post(
    //   `${process.env.API_URL}/products`,
    //   req.body
    // );
    const data = await Category.create(req.body);
    if (data.length == 0) {
      return res.status(400).json({ message: "Thêm  danh mục thất bại" });
    } else {
      return res.status(200).json({
        message: "Thêm  danh mục thành công",
        data,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: message });
  }
};
export const update = async (req, res) => {
  try {
    //validate
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // const { data } = await axios.put(
    //   `${process.env.API_URL}/products/${req.params.id}`,
    //   req.body
    // );
    const data = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (data.length == 0) {
      return res.status(400).json({ message: "Cập nhật danh mục thất bại" });
    } else {
      return res.status(200).json({
        message: "Cập nhật danh mục thành công",
        data,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export const deleteCategory = async (req, res) => {
  // await axios.delete(`${process.env.API_URL}/products/${req.params.id}`);
  await Category.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Xóa danh mục thành công" });
};
