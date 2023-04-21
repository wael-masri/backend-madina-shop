const mongoose = require("mongoose");
// 1- Create Schema
const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "coupon required!"],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "expire required!"],
    },
    discount: {
      type: Number,
      required: [true, "discount required!"],
    },
  },
  { timestamps: true }
);

// 2- Create model
module.exports = mongoose.model("Coupon", couponSchema);
