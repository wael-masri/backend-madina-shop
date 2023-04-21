const ApiError = (message,statusCode) => {
    const err = new Error();
    err.statusCode = statusCode
    err.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    err.message = message;
    err.isaOperational = true;
    return err
  };

  module.exports = ApiError;