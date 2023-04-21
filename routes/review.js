const express = require("express");
const { protect, allowedTo } = require("../controllers/authControllers");
const {
  createReview,
  getReview,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/reviewControllers");
const {
  createReviewValidator,
  getReviewValidatorById,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../validators/reviewValidators");

const router = express.Router({ mergeParams: true });


//ROUTES
router.post(
  "/",
  protect,
  allowedTo("user","admin","manager"),
  createReviewValidator,
  createReview
);
router.get("/", getReview);
router.get("/:id", getReviewValidatorById, getReviewById);
router.put(
  "/:id",
  protect,
  allowedTo("user","admin","manager"),
  updateReviewValidator,
  updateReview
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "user","manager"),
  deleteReviewValidator,
  deleteReview
);
module.exports = router;
