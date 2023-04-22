const express = require("express");

const { protect, allowedTo } = require("../controllers/authControllers");
const {
  createCashOrder,
  checkoutSession,
} = require("../controllers/orderControllers");

const router = express.Router();

//ROUTES
router.post(
  "/:cartId",
  protect,
  allowedTo("user", "admin", "manager"),
  createCashOrder
);
router.post(
  "/checkout-session/:cartId",
  protect,
  allowedTo("user", "admin", "manager"),
  checkoutSession
);
module.exports = router;
