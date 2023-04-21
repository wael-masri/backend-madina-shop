const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddlewar");
const Review = require("../models/reviewModel");
exports.getReviewValidatorById = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short review"),
  check("reply").optional(),
  check("rating")
    .notEmpty()
    .withMessage("rating value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("rating value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid user id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom(async (val, { req }) => {
      // check if logged user create review before
      const isreview = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (isreview) {
        return Promise.reject(new Error(`You already created a review before`));
      }
    }),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom(async (val, { req }) => {
      const review = await Review.findById(val);
      if (!review) {
        return Promise.reject(new Error(`there is no review with this id`));
      }
    }),

  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom(async (val, { req }) => {
      if (req.user.role === "user") {
        const review = await Review.findById(val);
        if (!review) {
          return Promise.reject(new Error(`there is no review with this id`));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`You are not allowed to perform this action`)
          );
        }
      }
      return true;
    }),
  validatorMiddleware,
];
