const mongoose = require("mongoose");
// 1- Create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand required"],
      unique: [true, "Brand must be unique"],
      minlength: [3, "Too short Brand name"],
      maxlength: [35, "Too long Brand name"],
    },
    image: String,
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

//BI RUN MA3 UPDATE, GET AND GET ALL
brandSchema.post("init", (doc) => {
  //return image url + image name
  setImageUrl(doc);
});

//HON KERML YRDLNA URL BASS Y3MOL CREATE LA POST
brandSchema.post("save", (doc) => {
  //return image url + image name
  setImageUrl(doc);
});

// 2- Create model
module.exports = mongoose.model("Brand", brandSchema);
