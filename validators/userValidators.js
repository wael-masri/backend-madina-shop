const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddlewar");
const User = require("../models/userModel");
const bcrypt = require('bcryptjs');
exports.getUserValidatorById = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 2 })
    .withMessage("Too short User name"),
  
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
  .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 6 characters"),
  check("phone")
  .optional()
    .isMobilePhone("ar-LB")
    .withMessage("Invalid phone number in lebanon"),
 
  
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  check("email")
  .optional()
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
  check("phone")
  .optional()
  .isMobilePhone("ar-LB")
  .withMessage("Invalid phone number in lebanon"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  check("currentPassword").notEmpty().withMessage("current password required"),
  check("password").optional().isLength({ min: 8 })
  .withMessage("Password must be at least 6 characters")
  .custom( async (password,{req}) => {
   const user = await User.findById(req.params.id);
   if(!user){
    return Promise.reject(new Error(`there is no user for this id`));
   }
 const isCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
 if(!isCorrect){
  return Promise.reject(new Error(`current password is not correct`));
 }
  }),
  validatorMiddleware,
];
