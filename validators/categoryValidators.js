const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddlewar");
const Category = require("../models/categoryModel");
//post CATEGORY VALIDATOR
exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("category required..")
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 35 })
    .withMessage("Too long category name")
    .custom((name) =>
    Category.findOne({ name }).then((cat) => {
        if (cat) {
          return Promise.reject(new Error(`this name is already in Category !`));
        }
      })
    ),
  check("status").notEmpty().withMessage("status required.."),
  validatorMiddleware,
];
//GET BY ID CATEGORY VALIDATOR
exports.getCategoryValidatorById = [
  check("id").isMongoId().withMessage("Invalid category id format.."),
  validatorMiddleware,
];
//UPDATE CATEGORY VALIDATOR
exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format.."),
  check("name")
    .notEmpty()
    .optional()
    .withMessage("category required..")
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 35 })
    .withMessage("Too long category name")
    .custom((name) =>
    Category.findOne({ name }).then((cat) => {
        if (cat) {
          return Promise.reject(new Error(`this name is already in Category !`));
        }
      })
    ),
  validatorMiddleware,
];

//DELETE CATEGORY VALIDATOR
exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format.."),
  validatorMiddleware,
];
