const express = require("express");
const passport = require("passport");
const cors = require("cors");
const {
  signup,
  login,
  forgotPassword,
  verifyPasswordCode,
  resetPassword,
  protect,
  verifyToken,
  sendEmailContact,
  sendEmailRegister,
  verifyEmailCode,
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
router.post("/verifyToken", protect, verifyToken);
router.post("/sendEmail", sendEmailContact);
router.post("/verifyEmail", verifyEmailCode);
router.post("/sendVerifyEmail", sendEmailRegister);

// GOOGLE AUTH
router.get("/login/success",	cors({
	origin: ["http://localhost:3000","https://madina-shop-frontend.onrender.com"],
	methods: "GET,POST,PUT,DELETE",
	credentials: true,
}), (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Loged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});
router.get(
  "/google",
  cors({
    origin: ["http://localhost:3000","https://madina-shop-frontend.onrender.com"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
  passport.authenticate("google", ["profile", "email"])
);
router.get(
  "/login/failed",
  cors({
    origin: ["http://localhost:3000","https://madina-shop-frontend.onrender.com"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
  (req, res) => {
    res.status(401).json({
      error: true,
      message: "Log in failure",
    });
  }
);
router.get(
  "/google/callback",
  cors({
    origin: ["http://localhost:3000","https://madina-shop-frontend.onrender.com"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
  passport.authenticate("google", {
    successRedirect: "https://backend-madina-shop.onrender.com/login",
    failureRedirect: "/login/failed",
  })
);
router.get("/logout",	cors({
	origin: ["http://localhost:3000","https://madina-shop-frontend.onrender.com"],
	methods: "GET,POST,PUT,DELETE",
	credentials: true,
}), (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("https://backend-madina-shop.onrender.com");
  });
});

module.exports = router;
