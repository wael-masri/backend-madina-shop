const crypto = require("crypto");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const sendEmail = require("../middlewares/sendEmail");

//CREATE TOKEN FUNCTION
const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRED_TIME,
  });

/*
  @ POST
  @ http://localhost:5000/api/auth/signup
  @ PUBLIC
*/
exports.signup = asyncHandler(async (req, res, next) => {
  req.body.password = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

/*
  @ POST
  @ http://localhost:5000/api/auth/login
  @ PUBLIC
*/
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(ApiError(`Incorrect email and password`, 401));
  }
  const token = createToken(user._id)
  const {password,...other} = user._doc
 
  res.status(200).json({...other, token });
});

/*
  @ POST
  @ http://localhost:5000/api/auth/forgotPassword
  @ PUBLIC
*/
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1)get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      ApiError(`there is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) if email exist, generate reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordResetCode = hashResetCode;
  // expired hayda l code ba3ed 10 min
  user.passwordResetexpired = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  const imageUrl = `${process.env.BASE_URL}/users/`;
  const imageWithoutUrl = user.profileImage.replace(imageUrl, "");
  user.profileImage = imageWithoutUrl;
  await user.save();
  // 3) send the reset code via email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      text: `Hi ${user.name}, \n We received a request to reset the password on your Madina shop account. \n
      ${resetCode} `,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetexpired = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(ApiError("there is error in sending email", 500));
  }

  res.status(200).json({ status: "success", msg: "Reset code sent to email" });
});

/*
  @ POST
  @ http://localhost:5000/api/auth/verifyPassword
  @ PUBLIC
*/
exports.verifyPasswordCode = asyncHandler(async (req, res, next) => {
  // 1) get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetexpired: { $gt: Date.now() },
  });

  if (!user) {
    return next(ApiError("Reset code invalid or expired", 500));
  }
  // 2) reset code valid
  user.passwordResetVerified = true;
  const imageUrl = `${process.env.BASE_URL}/users/`;
  const imageWithoutUrl = user.profileImage.replace(imageUrl, "");
  user.profileImage = imageWithoutUrl;
  await user.save();
  res.status(200).json({ status: "success" });
});

/*
  @ POST
  @ http://localhost:5000/api/auth/resetPassword
  @ PUBLIC
*/
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({email: req.body.email});
  if(!user){
    return next(ApiError("there is no user with email", 404));
  }
  if(!user.passwordResetVerified){
    return next(ApiError("Reset code not verified", 400));
  }
  user.password = await bcrypt.hash(req.body.newPassword, 12);
  user.passwordResetVerified = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetexpired = undefined;
  const imageUrl = `${process.env.BASE_URL}/users/`;
  const imageWithoutUrl = user.profileImage.replace(imageUrl, "");
  user.profileImage = imageWithoutUrl;
  await user.save();
  const token = createToken(user._id);
  res.status(200).json({token});
});

/*
  @ POST
  @ http://localhost:5000/api/auth/verifyToken
  @ PUBLIC
*/
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check if token exist, if exist get
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    
  }
  if (!token) {
   
    return next(ApiError("you are not login please signin", 401));
  }
  // 2) verify token exa t8yar l id aw expired 5eles
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if user exist hon eza re7na m7ina l user
  const currentUser = await User.findById(decoded.userId);
  
  if (!currentUser) {
   
    return next(
      ApiError("the user that belong to this token does no longer exist ", 401)
    );
  }
  // 4) check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    
    const passChangedToTimesTamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    //password changed after token created (error)
    if (passChangedToTimesTamp > decoded.iat) {
     
      return next(
        ApiError(
          "the user recently changed his password. please login again ",
          401
        )
      );
    }
  }
  req.user = currentUser;
  
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(ApiError("you are not allowed to access this route", 403));
    }
    next();
    // 1)access roles
    // 2)access registred user (req.user.role)
  });

// FOR PUBLIC AND PRIVATE ROUTES (REACT JS REACT ROUTER DOM)  
exports.verifyToken = asyncHandler(async(req,res,next) => {
  res.status(200).json({ user: req.user })
})