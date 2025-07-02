// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Determine the status code: if a status code was set in the response, use it; otherwise, default to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    res.json({
      message: err.message, // The error message
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Stack trace only in development
    });
  };
  
  module.exports = {
    errorHandler,
  };