const express = require("express");
const {
  resizeImage,
  createUser,
  getUser,
  getUserById,
  updateUser,
  deleteUser,
  uploadUserImage,
  changeUserPassword,
} = require("../controllers/userControllers");
const {
  createUserValidator,
  getUserValidatorById,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
} = require("../validators/userValidators");
const { protect, allowedTo } = require("../controllers/authControllers");
const router = express.Router();

//ROUTES
router.post(
  "/",
  protect,
  allowedTo("admin", "manager", "user"),
  uploadUserImage,
  createUserValidator,
  resizeImage,
  createUser
);
router.get("/", protect, allowedTo("admin", "manager", "user"), getUser);
router.get("/:id", getUserValidatorById, getUserById);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager", "user"),
  updateUserValidator,
  updateUser
);
router.post(
  "/uploadImage",
  protect,
  allowedTo("admin", "manager", "user"),
  uploadUserImage,
  resizeImage,
);
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  deleteUserValidator,
  deleteUser
);
module.exports = router;
