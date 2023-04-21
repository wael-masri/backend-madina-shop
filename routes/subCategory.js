const express = require("express");
const {
  createSubCategory,
  getSubCategory,
  getSubCategoryById,
  deleteSubCategory,
  updateSubCategory,
  getSubCategoryWithPopulate,
} = require("../controllers/subCategoryControllers");
const {
  createSubCategoryValidator,
  getSubCategoryValidatorById,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../validators/subCategoryValidators");
const { protect, allowedTo } = require("../controllers/authControllers");
const router = express.Router({ mergeParams: true });

//ROUTES
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  createSubCategoryValidator,
  createSubCategory
);
router.get("/", getSubCategory);
router.get("/withPopulate", getSubCategoryWithPopulate);
router.get("/:id", getSubCategoryValidatorById, getSubCategoryById);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  updateSubCategoryValidator,
  updateSubCategory
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  deleteSubCategoryValidator,
  deleteSubCategory
);
module.exports = router;
