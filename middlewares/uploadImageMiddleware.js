const multer = require("multer");
const ApiError = require("./errors/apiError");

// CODE REPEAT OF 2 FUNCTION
const multerOptions = () => {

  //MEMORY STORAGE
  const multerStorage = multer.memoryStorage();

  //FILTER FILE IF JPG PNG PDF...
  const multerFilter = function (req, file, cb) {
   
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(ApiError("Only images allowed", 400), false);
    }
  };

  // DESTINATION OF PHOTOS UPLOADED
  const uploadDestination = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });
  return uploadDestination;
};

exports.uploadSingleImage = (fieldname) => {
  return multerOptions().single(fieldname);
};

exports.uploadMixOfImages = (arrayOfFields) => {
  return multerOptions().fields(arrayOfFields);
};
