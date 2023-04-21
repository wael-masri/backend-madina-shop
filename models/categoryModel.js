const mongoose = require("mongoose");


//CATEGORY SCHEMA
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "schema => too short"],
      maxlength: [35, "schema => too long"],
    },
    numberOfProduct:{
      type:Number,
      default:0
    },
    image: String,
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);
//MONGOOSE MIDDLEEWARE HON KERML NZID URL 3AL SOURA MN BA3ED MA SAVED BL DB Y3NI 
//BIRDLNA URL BASS MSH MWJOUD BL DB

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

//BI RUN MA3 UPDATE, GET AND GET ALL
categorySchema.post("init", (doc) => {
  //return image url + image name
  setImageUrl(doc);
});

//HON KERML YRDLNA URL BASS Y3MOL CREATE LA POST
categorySchema.post("save", (doc) => {
  //return image url + image name
  setImageUrl(doc);
});


const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
