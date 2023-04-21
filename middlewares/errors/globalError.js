const ApiError = require("./apiError");

const globalError = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "global error";
  
    if (process.env.NODE_ENV === "development") {
      if(err.name === "JsonWebTokenError"){
      err = ApiError("Invalid token,please login again..",401);
      }
      if(err.name === "TokenExpiredError"){
        err = ApiError("Expired token,please login again..",401);
        }
       sendErrorForDev(err, res);
    } else {
      if(err.name === "JsonWebTokenError"){
        err = ApiError("Invalid token,please login again..",401);
        }
        if(err.name === "TokenExpiredError"){
          err = ApiError("Expired token,please login again..",401);
          }
      sendErrorForPro(err, res);
    }
  };
   
  //FOR DEVELOPMENT
  const sendErrorForDev = (err, res) => {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  };
  //FOR PRODUCTION
  const sendErrorForPro = (err, res) => {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  };
 
  module.exports = globalError;
  