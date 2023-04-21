const express = require("express");
const {
  deleteBrand,
  updateBrand,
  getBrandById,
  getBrand,
  createBrand,
  resizeImage,
  uploadBrandImage,
} = require("../controllers/brandControllers");
const {
  createBrandValidator,
  getBrandValidatorById,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../validators/brandValidators");
const { protect, allowedTo } = require("../controllers/authControllers");

const router = express.Router();

//ROUTES
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  createBrandValidator,
  createBrand
);
router.post(
  "/uploadImage",
  protect,
  allowedTo("admin", "manager"),
  uploadBrandImage,
  resizeImage
);
router.get("/", getBrand);
router.get("/:id", getBrandValidatorById, getBrandById);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  updateBrandValidator,
  updateBrand
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  deleteBrandValidator,
  deleteBrand
);
module.exports = router;
