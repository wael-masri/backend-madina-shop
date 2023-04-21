const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

/*
  @ POST
  @ http://localhost:5000/api/users/
  @ PRIVATE
*/
exports.createUser = asyncHandler(async (req, res) => {
  req.body.password = await bcrypt.hash(req.body.password, 12);
  const newUser = await User.create(req.body);
  res.status(200).json({ data: newUser });
});

/*
  @ GET
  @ http://localhost:5000/api/users/
  @ http://localhost:5000/api/users/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/users/?sort=-rating
  @ http://localhost:5000/api/users/?limit=5
  @ http://localhost:5000/api/users/?keyword=elect
  @ http://localhost:5000/api/users/?fields=name,rating
  @ PUBLIC
*/
exports.getUser = asyncHandler(async (req, res, next) => {
  const documentCounts = await User.countDocuments();
  const apiFeatures = new ApiFeatures(User.find(), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort();
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const users = await mongooseQuery;
  res
    .status(200)
    .json({ results: users.length, paginationResult, data: users });
});

/*
  @ GET
  @ http://localhost:5000/api/users/:id
  @ PUBLIC
*/
exports.getUserById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(ApiError(`No user for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: user });
  }
});

/*
  @ PUT
  @ http://localhost:5000/api/users/:id
  @ PRIVATE
*/
exports.updateUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findOneAndUpdate(
    { _id: id },
    req.body.rmvWish
      ? { $pull: { wishList: req.body.rmvWish } }
      : req.body.pushWish
      ? { $push: { wishList: req.body.pushWish } }
      : { $set: req.body },
    { new: true }
  );
  if (!user) {
    return next(ApiError(`No user for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: user });
  }
});
// CHANGE PASSWORD USERS
/* example:
    -put
    -http://localhost:5000/api/users/changePassword/:id
{
    "currentPassword": "1234567",
    "password":"123123123",
    "passwordConfirm":"123123123"
} 
*/
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findOneAndUpdate(
    { _id: id },
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!user) {
    return next(ApiError(`No user for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: user });
  }
});

/*
  @ DELETE
  @ http://localhost:5000/api/users/:id
  @ PRIVATE
*/
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(ApiError(`No user for this id ${id}`, 404));
  } else {
    res.status(200).json({ msg: "user has been deleted.." });
  }
});

//MIDDLEWARE UPLOADED SINGLE IMAGE
exports.uploadUserImage = uploadSingleImage("profileImage");

//MIDDLEWARE RESIZE SINGLE IMAGE
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    var image = "";
    const fileName =
      "user-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + ".jpeg";
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile("assets/uploads/users/" + fileName);
    //save image into our db
    image = fileName;
  }
  res.status(200).json({ data: image });
});
