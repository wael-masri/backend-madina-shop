const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddlewar");
const Brand = require("../models/brandModel");
//post Brand VALIDATOR
exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand required..")
    .isLength({ min: 3 })
    .withMessage("Too short Brand name")
    .isLength({ max: 35 })
    .withMessage("Too long Brand name")
    .custom((name) =>
    Brand.findOne({ name }).then((cat) => {
        if (cat) {
          return Promise.reject(new Error(`this name is already in Brand !`));
        }
      })
    ),
  check("status").notEmpty().withMessage("status required.."),
  validatorMiddleware,
];
//GET BY ID Brand VALIDATOR
exports.getBrandValidatorById = [
  check("id").isMongoId().withMessage("Invalid Brand id format.."),
  validatorMiddleware,
];
//UPDATE Brand VALIDATOR
exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format.."),
  check("name")
  .notEmpty()
  .optional()
  .withMessage("Brand required..")
  .isLength({ min: 3 })
  .withMessage("Too short Brand name")
  .isLength({ max: 35 })
  .withMessage("Too long Brand name")
  .custom((name) =>
  Brand.findOne({ name }).then((cat) => {
      if (cat) {
        return Promise.reject(new Error(`this name is already in Brand !`));
      }
    })
  ),
  validatorMiddleware,
];

//DELETE Brand VALIDATOR
exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format.."),
  validatorMiddleware,
];

