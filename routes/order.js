const express = require("express");

const { protect, allowedTo } = require("../controllers/authControllers");
const {
  createCashOrder,
  checkoutSession,
  getOrder,
  filterOrderForLoggedUser
} = require("../controllers/orderControllers");

const router = express.Router();

//ROUTES
router.post(
  "/:cartId",
  protect,
  allowedTo("user", "admin", "manager"),
  createCashOrder
);
router.get(
  "/",
  getOrder
);
router.get(
  "/byUser",
  protect,
  allowedTo("user", "admin", "manager"),
  filterOrderForLoggedUser,
  getOrder
);
router.post(
  "/checkout-session/:cartId",
  protect,
  allowedTo("user", "admin", "manager"),
  checkoutSession
);
module.exports = router;
