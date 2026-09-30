// Runs only if no route above it matched. Turns an unmatched request
// into a proper 404 error object and hands it to errorHandler, instead
// of Express's default plain-text "Cannot GET /whatever" page.
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

module.exports = notFound;
