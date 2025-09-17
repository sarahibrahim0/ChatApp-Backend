const errorHandler = (err, req, res , next) => {
  
  console.error(err.stack); // يطبع الاستاك تريس في السيرفر (للديفيلوبر)

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    // لو حابة تضيفي تفاصيل أكتر وقت الـ development
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = errorHandler;