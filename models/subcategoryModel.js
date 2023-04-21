const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'SubCategory must be unique'],
      minlength: [3, 'To short SubCategory name'],
      maxlength: [35, 'To long SubCategory name'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'SubCategory must be belong to parent category'],
    },
    status: {
        type: Boolean,
        required: true,
      },
    
  },
  { timestamps: true }
);
// kel ma ne3mol finde y3mlna populate w yjblna name of category
// subCategorySchema.pre(/^find/, function (next) {
//   this.populate({ path: "category", select: "name image -_id" });
//   next();
// });
module.exports = mongoose.model('SubCategory', subCategorySchema);