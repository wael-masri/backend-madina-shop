const express = require("express");
const reviewRoute = require("./review")
const {
  createProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/productControllers");
const {
  createProductValidator,
  getProductByIdValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../validators/productValidators");
const { protect, allowedTo } = require("../controllers/authControllers");

const router = express.Router();
router.use("/:productId/reviews", reviewRoute);
//ROUTES
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  createProductValidator,
  createProduct
);
router.post(
  "/uploadImage",
  protect,
  allowedTo("admin", "manager", "user"),
  uploadProductImages,
  resizeProductImages,
);
router.get("/", getProduct);
router.get("/:id", getProductByIdValidator, getProductById);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
 //  uploadProductImages,
   updateProductValidator,
 //  resizeProductImages,
   updateProduct
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  deleteProductValidator,
  deleteProduct
);
module.exports = router;
