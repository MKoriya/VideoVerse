class APIError extends Error {
    /**
     * Create an API Error instance.
     * @param {number} statusCode - HTTP status code for the error.
     * @param {string} message - Error message to return in the response.
     */
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;

        // Capture the stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = APIError;
