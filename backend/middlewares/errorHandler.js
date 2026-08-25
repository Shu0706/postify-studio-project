const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`Error ${err.name}: ${err.message}`.red);
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      name: 'CastError',
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      name: 'DuplicateError',
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      name: 'ValidationError',
      message,
      statusCode: 400
    };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      name: 'JsonWebTokenError',
      message,
      statusCode: 401
    };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      name: 'TokenExpiredError',
      message,
      statusCode: 401
    };
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = {
      name: 'FileSizeError',
      message,
      statusCode: 400
    };
  }

  // Multer file type error
  if (err.code === 'LIMIT_FILE_TYPE') {
    const message = 'Invalid file type';
    error = {
      name: 'FileTypeError',
      message,
      statusCode: 400
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Server Error';

  // Don't leak error details in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.name,
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
