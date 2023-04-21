const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddlewar");
const Category = require("../models/categoryModel");

//CREATE SUBCATEGORY VALIDATORS
exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("category required..")
    .isLength({ min: 3 })
    .withMessage("Too short subcategory name")
    .isLength({ max: 35 })
    .withMessage("Too long subcategory name"),
  check("status").notEmpty().withMessage("status required.."),
  check("category")
    .notEmpty()
    .withMessage("subcat must be belong category..")
    .isMongoId()
    .withMessage("Invalid category id format..")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),
  validatorMiddleware,
];

exports.getSubCategoryValidatorById = [
  check("id").isMongoId().withMessage("Invalid subcategory id format.."),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format.."),
  validatorMiddleware,
];


exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format.."),
  validatorMiddleware,
];
