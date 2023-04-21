const express = require("express");
const {
  createCategory,
  getCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../controllers/categoryControllers");
const subCategoryRoute = require("./subCategory");
const {
  createCategoryValidator,
  getCategoryValidatorById,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../validators/categoryValidators");
const { protect, allowedTo } = require("../controllers/authControllers");

const router = express.Router();
// Nested route
router.use("/:categoryId/subCategories", subCategoryRoute);
//ROUTES
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  createCategoryValidator,
  createCategory
);
router.post(
  "/uploadImage",
  protect,
  allowedTo("admin", "manager"),
  uploadCategoryImage,
  resizeImage
);
router.get("/", getCategory);
router.get("/:id", getCategoryValidatorById, getCategoryById);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  updateCategoryValidator,
  updateCategory
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  deleteCategoryValidator,
  deleteCategory
);
module.exports = router;
