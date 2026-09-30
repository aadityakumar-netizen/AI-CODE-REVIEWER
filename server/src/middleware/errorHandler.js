// Express recognizes an error-handling middleware by its 4 arguments
// (err, req, res, next) — that signature is what tells Express to route
// errors here instead of treating it as a normal middleware.
//
// Every route/controller can just call next(err) and it lands here,
// so error formatting lives in ONE place instead of being repeated in
// every controller with its own try/catch res.status(...).json(...).

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server.';

  // Mongoose throws a CastError when a value can't be converted to the
  // type the schema expects — most commonly, a malformed ObjectId in a
  // URL param like /api/reviews/not-a-real-id. That's a client mistake
  // (bad input), not a server failure, so it should be a 400, not a 500 —
  // and the client shouldn't see Mongoose's internal error wording.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    // Never leak stack traces or internal details to the client —
    // only a safe, human-readable message.
    message,
  });
}

module.exports = errorHandler;
