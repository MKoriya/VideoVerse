const APIError = require('../utils/APIError');

function getToken() {
    return process.env.AUTH_TOKEN || 'yZBekCcz5zxbmXR2Fxo1jt8I5S8OFsby';
}

function authenticate(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        throw new APIError(401, 'Authorization token is required');
    }

    if (token !== `Bearer ${getToken()}`) {
        throw new APIError(403, 'Invalid authorization token');
    }

    next();
}

module.exports = {
    authenticate,
    getToken,
};
