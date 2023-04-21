const express = require("express");

const { protect, allowedTo } = require("../controllers/authControllers");
const {
  createCoupon,
  getCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponControllers");

const router = express.Router();

//ROUTES
router.post("/", protect, allowedTo("manager","admin", "user"), createCoupon);
router.get("/", getCoupon);
router.get("/:id", getCouponById);
router.put("/:id", protect, allowedTo("manager","admin", "user"), updateCoupon);
router.delete("/:id", protect, allowedTo("manager","admin", "user"), deleteCoupon);
module.exports = router;
