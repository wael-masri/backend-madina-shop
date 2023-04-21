const express = require("express");

const { protect, allowedTo } = require("../controllers/authControllers");
const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../controllers/cartControllers");

const router = express.Router();

//ROUTES
router.post(
  "/",
  protect,
  allowedTo("user", "admin", "manager"),
  addProductToCart
);
router.put(
  "/coupon",
  protect,
  allowedTo("user", "admin", "manager"),
  applyCoupon
);
router.get(
  "/",
  protect,
  allowedTo("user", "admin", "manager"),
  getLoggedUserCart
);
router.put(
  "/:itemId",
  protect,
  allowedTo("admin", "user", "manager"),
  updateCartItemQuantity
);
router.delete(
  "/:itemId",
  protect,
  allowedTo("user", "manager", "manager"),
  removeSpecificCartItem
);
router.delete(
  "/clear/all",
  protect,
  allowedTo("user", "manager", "manager"),
  clearCart
);
module.exports = router;
