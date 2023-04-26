const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyPasswordCode,
  resetPassword,
  protect,
  verifyToken,
  sendEmailContact,
} = require("../controllers/authControllers");
const {
  signupValidator,
  loginValidator,
} = require("../validators/authValidators");

const router = express.Router();

//ROUTES
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyPassword", verifyPasswordCode);
router.post("/resetPassword", resetPassword);
router.post("/verifyToken",protect,verifyToken);
router.post("/sendEmail",sendEmailContact);
module.exports = router;
