/**
 * Centralized error handler middleware.
 * @param {object} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
function errorMiddleware(err, req, res, next) {
    // If the error is an instance of APIError, use its properties
    if (err.name === 'APIError') {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    // Handle other unexpected errors
    console.error(err);
    return res.status(500).json({
        error: 'Internal Server Error',
    });
}

module.exports = { errorMiddleware };
