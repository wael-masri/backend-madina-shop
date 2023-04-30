const mongoose = require("mongoose");
// 1- Create Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
      minlength: [3, "Too short  name"],
      maxlength: [22, "Too long  name"],
    },
    googleId: String,
    email: {
      type: String,
      trim: true,
      required: [true, "email required"],
      unique: [true, "email must be unique"],
      lowercase: true,
    },
    phone: {
      type: String,
    },
    profileImage: {
      type: String,
      default: ''
    },
    imageGoogle:{
      type:String
    },
    tokenGoogle:{
      type:String
    },
    password: {
      type: String,
      minlength: [8, "Too short password"],
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetexpired: {
      type: Date,
    },
    passwordResetVerified: {
      type: Boolean,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    emailVerify: {
      type: String,
    },
    emailVerifyexpired: {
      type: Date,
    },
    
    wishList: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
  },
  { timestamps: true }
);
const setImageUrl = (doc) => {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    doc.profileImage = imageUrl;
  }
};

//BI RUN MA3 UPDATE, GET AND GET ALL
userSchema.post("init", (doc) => {
  //return image url + image name
  setImageUrl(doc);
});

//HON KERML YRDLNA URL BASS Y3MOL CREATE LA POST
userSchema.post("save", (doc) => {
  //return image url + image name
  setImageUrl(doc);
});
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "wishList"
  });

  next();
});
// 2- Create model
module.exports = mongoose.model("User", userSchema);
