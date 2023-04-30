const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddlewar");
const User = require("../models/userModel");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name required")
    .isLength({ min:3,max:22 })
    .withMessage("Too short User name")
   ,
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("This email not valid")
    .custom((email) =>
      User.findOne({ email }).then((user) => {
        if (user) {
          return Promise.reject(new Error(`this email is already in user`));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  validatorMiddleware,
];
exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("This email not valid"),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  validatorMiddleware,
];
